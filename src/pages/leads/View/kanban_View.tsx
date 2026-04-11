import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Eye, MoreVertical, Pencil, Search, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import LeadStatusPopup from "../../../component/GridView_Popup/LeadStatusPopup";
import { fetchLeads, fetchStatuses, updateLeadkanban } from "../../../store/homepage_slice/Leads_slice";
import type { AppDispatch } from "../../../store/Store";

// --- Types ---
interface Lead {
  _id: string;
  LeadId: string;
  manualData: {
    name: string;
    email: string;
    mobileNo: string;
    company: string;
  };
  leadstatus: {
    _id: string;
    statusName: string;
    color: string;
  };
  followUps?: any[];
  createdAt?: string;
}

const priorityOptions = [
  { value: "high", label: "High", color: "bg-red-600" },
  { value: "medium", label: "Medium", color: "bg-orange-500" },
  { value: "low", label: "Low", color: "bg-green-700" },
];

const WON_STATUS_NAMES = ["won", "closed won", "winner", "success"];
const LOST_STATUS_NAMES = ["lost", "closed lost", "loser", "failed"];

const Kanban_View = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const { leadsData, statusOptions, loading } = useSelector((state: any) => state.leads);
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);

  const [localLeads, setLocalLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("");
  const [popup, setPopup] = useState<{ type: 'won' | 'lost'; leadName: string; leadId: string } | null>(null);
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Theme-based styles
  const getPageBg = () => darkMode ? 'bg-gray-900' : 'bg-[#F8FAFC]';
  const getSearchInputBg = () => darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-slate-200';
  const getSearchTextColor = () => darkMode ? 'text-gray-400' : 'text-slate-400';
  const getResultTextColor = () => darkMode ? 'text-gray-500' : 'text-slate-500';
  const getFilterButtonBg = (isActive: boolean) => {
    if (isActive) return darkMode ? `bg-${primaryColor}-600 text-white` : 'bg-indigo-600 text-white';
    return darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-slate-600 hover:bg-slate-100';
  };
  const getSelectBg = () => darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-slate-200 text-slate-700';
  const getColumnBg = (isDraggingOver: boolean, isWon: boolean, isLost: boolean) => {
    if (isDraggingOver) {
      if (isWon) return 'bg-green-900/20 ring-2 ring-green-500';
      if (isLost) return 'bg-red-900/20 ring-2 ring-red-500';
      return darkMode ? 'bg-gray-700 ring-2 ring-indigo-500' : 'bg-slate-100 ring-2 ring-indigo-400';
    }
    return darkMode ? 'bg-gray-800' : 'bg-slate-50';
  };
  const getColumnHeaderTextColor = (isWon: boolean, isLost: boolean) => {
    if (isWon) return 'text-green-400';
    if (isLost) return 'text-red-400';
    return darkMode ? 'text-gray-200' : 'text-slate-700';
  };
  const getCountBadgeBg = (isWon: boolean, isLost: boolean) => {
    if (isWon) return darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700';
    if (isLost) return darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
    return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-slate-200 text-slate-600';
  };
  const getCardBg = (isWon: boolean, isLost: boolean) => {
    if (isWon) return darkMode ? 'border-green-800 bg-green-900/20 hover:bg-green-900/30' : 'border-green-200 bg-green-50/50 hover:bg-green-50';
    if (isLost) return darkMode ? 'border-red-800 bg-red-900/20 hover:bg-red-900/30' : 'border-red-200 bg-red-50/50 hover:bg-red-50';
    return darkMode ? 'border-gray-700 bg-gray-800 hover:border-indigo-600' : 'border-slate-200 bg-white hover:border-indigo-200';
  };
  const getCardTextColor = () => darkMode ? 'text-gray-300' : 'text-slate-600';
  const getCardLabelColor = () => darkMode ? 'text-gray-500' : 'text-slate-400';
  const getMenuBg = () => darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100';
  const getMenuTextColor = () => darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-slate-700 hover:bg-slate-50';
  const getMenuIconColor = () => darkMode ? 'text-gray-500' : 'text-slate-400';
  const getDividerColor = () => darkMode ? 'border-gray-700' : 'border-slate-100';

  useEffect(() => {
    dispatch(fetchLeads());
    if (statusOptions.length === 0) {
      dispatch(fetchStatuses());
    }
  }, [dispatch, statusOptions.length]);

  useEffect(() => {
    if (leadsData?.leads) {
      setLocalLeads(leadsData.leads);
    }
  }, [leadsData]);

  const filteredLeads = useMemo(() => {
    let filtered = localLeads;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.manualData?.name?.toLowerCase().includes(lowerSearch) ||
          lead.manualData?.company?.toLowerCase().includes(lowerSearch) ||
          lead.manualData?.email?.toLowerCase().includes(lowerSearch) ||
          lead.manualData?.mobileNo?.toLowerCase().includes(lowerSearch) ||
          lead.LeadId?.toLowerCase().includes(lowerSearch) ||
          lead.leadstatus?.statusName?.toLowerCase().includes(lowerSearch)
      );
    }

    if (priorityFilter) {
      filtered = filtered.filter(
        (lead) => lead.followUps?.slice(-1)[0]?.priority === priorityFilter
      );
    }

    if (leadStatusFilter) {
      filtered = filtered.filter(
        (lead) => lead.leadstatus?.statusName?.toLowerCase() === leadStatusFilter.toLowerCase()
      );
    }

    return filtered;
  }, [localLeads, searchTerm, priorityFilter, leadStatusFilter]);

  const isWonStatus = (statusName: string) => {
    return WON_STATUS_NAMES.includes(statusName.toLowerCase());
  };

  const isLostStatus = (statusName: string) => {
    return LOST_STATUS_NAMES.includes(statusName.toLowerCase());
  };

  const showStatusPopup = (type: 'won' | 'lost', leadId: string, leadName: string) => {
    setPopup({ type, leadName, leadId });
    setTimeout(() => {
      setPopup(null);
    }, 2000);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const draggedLead = localLeads.find((lead) => lead.LeadId === draggableId);
    const destinationStatus = statusOptions.find(
      (s: any) => s._id === destination.droppableId
    );

    if (draggedLead && destinationStatus) {
      const statusName = destinationStatus.statusName;
      
      if (isWonStatus(statusName)) {
        showStatusPopup('won', draggableId, draggedLead.manualData?.name || 'Lead');
      } else if (isLostStatus(statusName)) {
        showStatusPopup('lost', draggableId, draggedLead.manualData?.name || 'Lead');
      }
    }

    const updatedLeads = localLeads.map((lead) => {
      if (lead.LeadId === draggableId) {
        const newStatus = statusOptions.find(
          (s: any) => s._id === destination.droppableId
        );
        return {
          ...lead,
          leadstatus: newStatus || lead.leadstatus,
        };
      }
      return lead;
    });

    setLocalLeads(updatedLeads);

    dispatch(
      updateLeadkanban({
        leadId: draggableId,
        formData: { leadstatusid: destination.droppableId },
      })
    ).catch((error) => {
      console.error("Failed to update lead status:", error);
      setLocalLeads(leadsData?.leads || []);
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriorityFilter("");
    setLeadStatusFilter("");
  };

  const handleOpenMenu = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.right + window.scrollX - 200,
    });
    setSelectedLead(lead);
    setActiveMenuId(lead.LeadId);
  };

  const handleEditLead = () => {
    if (selectedLead) {
      navigate(`/${localStorage.getItem('subdomain')}/leads/create-leads`, {
        state: {
          tableData: selectedLead,
          tableId: selectedLead.LeadId
        }
      });
      setActiveMenuId(null);
    }
  };

  const handleAddFollowUp = () => {
    if (selectedLead) {
      setSearchParams({
        modal: "schedule-followup",
        LeadId: selectedLead.LeadId
      });
      setActiveMenuId(null);
    }
  };

  const handleViewLead = () => {
    if (selectedLead) {
      navigate(`/${localStorage.getItem('subdomain')}/leads/view-leads`, {
        state: { tableId: selectedLead.LeadId }
      });
      setActiveMenuId(null);
    }
  };

  const handleConvertCustomer = () => {
    if (selectedLead) {
      setSearchParams({
        modal: "convert-customer",
        LeadId: selectedLead.LeadId
      });
      setActiveMenuId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className={`w-full h-full p-4 flex flex-col ${getPageBg()}`}>
      {/* HEADER / FILTERS */}
      <div className="sticky top-0 z-20 pb-4 space-y-3" style={{ backgroundColor: darkMode ? '#111827' : '#F8FAFC' }}>
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${getSearchTextColor()}`} size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, company, Lead ID, status..."
            className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${getSearchInputBg()}`}
            style={
  {
    '--tw-ring-color': `${primaryColor}20`
  } as React.CSSProperties
}
          />
          {searchTerm && (
            <button
              onClick={clearFilters}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${getSearchTextColor()} hover:${darkMode ? 'text-gray-300' : 'text-slate-600'}`}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-1.5 rounded-lg border p-1 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPriorityFilter(priorityFilter === opt.value ? "" : opt.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${getFilterButtonBg(priorityFilter === opt.value)}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            value={leadStatusFilter}
            onChange={(e) => setLeadStatusFilter(e.target.value)}
            className={`text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 transition-all ${getSelectBg()}`}
            style={
  {
    '--tw-ring-color': `${primaryColor}20`
  } as React.CSSProperties
}
          >
            <option value="">All Statuses</option>
            {statusOptions?.map((status: any) => (
              <option key={status._id} value={status.statusName}>
                {status.statusName}
              </option>
            ))}
          </select>

          {(searchTerm || priorityFilter || leadStatusFilter) && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium transition-colors"
              style={{ color: primaryColor || '#6366f1' }}
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Results Count */}
        {searchTerm && (
          <div className={`text-xs ${getResultTextColor()}`}>
            Found {filteredLeads.length} result{filteredLeads.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* KANBAN BOARD */}
      {loading && localLeads.length === 0 ? (
        <div className={`flex-1 flex items-center justify-center ${getResultTextColor()}`}>
          Loading board...
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4 -mr-2 pr-2">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 items-start h-full min-h-[500px]">
              {statusOptions?.map((status: any) => {
                const columnLeads = filteredLeads.filter(
                  (lead) => lead.leadstatus?._id === status._id
                );
                
                const isWonColumn = isWonStatus(status.statusName);
                const isLostColumn = isLostStatus(status.statusName);
                const isSpecialColumn = isWonColumn || isLostColumn;

                return (
                  <Droppable key={status._id} droppableId={status._id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-w-[280px] w-[280px] rounded-xl flex flex-col transition-all duration-300 ${getColumnBg(snapshot.isDraggingOver, isWonColumn, isLostColumn)}`}
                      >
                        {/* Column Header */}
                        <div className="sticky top-0 bg-inherit rounded-t-xl p-3 border-b" style={{ borderBottomColor: darkMode ? '#374151' : '#e2e8f0' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: status.color || "#ccc" }}
                              />
                              <h3 className={`font-semibold text-sm ${getColumnHeaderTextColor(isWonColumn, isLostColumn)}`}>
                                {status.statusName}
                              </h3>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getCountBadgeBg(isWonColumn, isLostColumn)}`}>
                              {columnLeads.length}
                            </span>
                          </div>
                        </div>

                        {/* Scrollable Cards Container */}
                        <div className="flex flex-col gap-2 p-3 max-h-[calc(100vh-280px)] overflow-y-auto">
                          {columnLeads.map((lead, index) => (
                            <Draggable
                              key={lead.LeadId}
                              draggableId={lead.LeadId}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`relative p-3 rounded-lg border group hover:shadow-md transition-all ${getCardBg(isWonColumn, isLostColumn)} ${
                                    snapshot.isDragging ? "shadow-lg scale-[1.02] rotate-1 z-50 ring-2" : ""
                                  }`}
                                  style={{ 
  ...provided.draggableProps.style,
  ...(snapshot.isDragging && {
    boxShadow: `0 0 0 3px ${primaryColor}`
  })
}}
                                >
                                  {/* Menu Button */}
                                  <button
                                    onClick={(e) => handleOpenMenu(e, lead)}
                                    className={`absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}
                                  >
                                    <MoreVertical size={14} className={getSearchTextColor()} />
                                  </button>

                                  {/* Header */}
                                  <div className="flex items-start gap-2 mb-2 pr-6">
                                    <div
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                      style={{ backgroundColor: lead.leadstatus?.color || primaryColor || '#6366f1' }}
                                    >
                                      {lead.manualData?.name?.charAt(0) || 'L'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className={`font-semibold text-xs mb-0.5 truncate ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                                        {lead.manualData?.name || "Unknown Lead"}
                                      </h4>
                                      <p className="text-[10px] font-medium truncate" style={{ color: primaryColor || '#6366f1' }}>
                                        {lead.LeadId}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Details */}
                                  <div className="space-y-1 mb-2">
                                    <div className={`text-[10px] truncate ${getCardTextColor()}`}>
                                      <span className={`font-medium ${getCardLabelColor()}`}>Email:</span> {lead.manualData?.email || "N/A"}
                                    </div>
                                    <div className={`text-[10px] truncate ${getCardTextColor()}`}>
                                      <span className={`font-medium ${getCardLabelColor()}`}>Mobile:</span> {lead.manualData?.mobileNo || "N/A"}
                                    </div>
                                    <div className={`text-[10px] truncate ${getCardTextColor()}`}>
                                      <span className={`font-medium ${getCardLabelColor()}`}>Company:</span> {lead.manualData?.company || "N/A"}
                                    </div>
                                  </div>

                                  {/* Footer */}
                                  <div className={`flex items-center justify-between pt-1.5 border-t ${getDividerColor()}`}>
                                    <span
                                      className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                                      style={{
                                        backgroundColor: `${lead.leadstatus?.color}15`,
                                        color: lead.leadstatus?.color
                                      }}
                                    >
                                      {lead.leadstatus?.statusName?.substring(0, 12)}
                                    </span>
                                    <span className={`text-[9px] font-medium ${getCardLabelColor()}`}>
                                      {formatDate(lead.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          
                          {/* Empty State */}
                          {columnLeads.length === 0 && (
                            <div className={`text-center py-6 text-xs ${getCardLabelColor()}`}>
                              No leads in this column
                            </div>
                          )}
                        </div>
                        
                        {/* Drop hint for Won/Lost columns */}
                        {snapshot.isDraggingOver && isSpecialColumn && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 mb-2 mx-3 text-center text-[10px] font-medium py-1.5 rounded-lg"
                            style={{
                              backgroundColor: isWonColumn ? '#22c55e15' : '#ef444415',
                              color: isWonColumn ? (darkMode ? '#4ade80' : '#166534') : (darkMode ? '#f87171' : '#991b1b')
                            }}
                          >
                            {isWonColumn ? '🎉 Drop to mark as WON!' : '😔 Drop to mark as LOST'}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* PORTAL FOR THE DROPDOWN MENU */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeMenuId !== null && selectedLead && (
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setActiveMenuId(null)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left, zIndex: 9999 }}
                className={`w-[200px] rounded-xl shadow-xl border p-1 py-2 ${getMenuBg()}`}
              >
                <button
                  onClick={handleEditLead}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-semibold text-left ${getMenuTextColor()}`}
                >
                  <Pencil size={14} className={getMenuIconColor()} /> Edit lead
                </button>

                <button
                  onClick={handleAddFollowUp}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-semibold text-left ${getMenuTextColor()}`}
                >
                  <Calendar size={14} className={getMenuIconColor()} /> Add Follow-Up
                </button>

                <button
                  onClick={handleViewLead}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-semibold text-left ${getMenuTextColor()}`}
                >
                  <Eye size={14} className={getMenuIconColor()} /> View Lead
                </button>

                <div className={`my-1 mx-2 border-t ${getDividerColor()}`} />

                <button
                  onClick={handleConvertCustomer}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-bold text-left ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-slate-800 hover:bg-slate-50'}`}
                >
                  <Users size={14} className={getMenuIconColor()} /> Convert Customer
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Won/Lost Popup */}
      {popup && (
        <LeadStatusPopup
          type={popup.type}
          leadName={popup.leadName}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
};

export default Kanban_View;