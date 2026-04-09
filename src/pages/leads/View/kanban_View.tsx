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

// --- Types (Matching your slice) ---
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

// Define Won and Lost status names (adjust based on your actual status names)
const WON_STATUS_NAMES = ["won", "closed won", "winner", "success"];
const LOST_STATUS_NAMES = ["lost", "closed lost", "loser", "failed"];

const Kanban_View = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  // Redux State
  const { leadsData, statusOptions, loading } = useSelector(
    (state: any) => state.leads
  );

  // Local State
  const [localLeads, setLocalLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("");
  const [popup, setPopup] = useState<{ type: 'won' | 'lost'; leadName: string; leadId: string } | null>(null);
  
  // Menu State for CRUD operations
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Initial Data Fetching
  useEffect(() => {
    dispatch(fetchLeads());
    if (statusOptions.length === 0) {
      dispatch(fetchStatuses());
    }
  }, [dispatch, statusOptions.length]);

  // Sync Redux Leads to Local State (for instant UI updates during drag)
  useEffect(() => {
    if (leadsData?.leads) {
      setLocalLeads(leadsData.leads);
    }
  }, [leadsData]);

  // Apply Filters
  const filteredLeads = useMemo(() => {
    let filtered = localLeads;

    // Search filter
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

    // Priority filter
    if (priorityFilter) {
      filtered = filtered.filter(
        (lead) => lead.followUps?.slice(-1)[0]?.priority === priorityFilter
      );
    }

    // Lead Status filter
    if (leadStatusFilter) {
      filtered = filtered.filter(
        (lead) => lead.leadstatus?.statusName?.toLowerCase() === leadStatusFilter.toLowerCase()
      );
    }

    return filtered;
  }, [localLeads, searchTerm, priorityFilter, leadStatusFilter]);

  // Check if status is Won or Lost
  const isWonStatus = (statusName: string) => {
    return WON_STATUS_NAMES.includes(statusName.toLowerCase());
  };

  const isLostStatus = (statusName: string) => {
    return LOST_STATUS_NAMES.includes(statusName.toLowerCase());
  };

  // Show popup for Won/Lost
  const showStatusPopup = (type: 'won' | 'lost', leadId: string, leadName: string) => {
    setPopup({ type, leadName, leadId });
    setTimeout(() => {
      setPopup(null);
    }, 2000);
  };

  // Drag and Drop Handler
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

    // Optimistic UI Update
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

    // Dispatch API Call
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

  // Handle opening the menu for CRUD operations
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

  // Handle Edit Lead
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

  // Handle Add Follow-Up
  const handleAddFollowUp = () => {
    if (selectedLead) {
      setSearchParams({
        modal: "schedule-followup",
        LeadId: selectedLead.LeadId
      });
      setActiveMenuId(null);
    }
  };

  // Handle View Lead
  const handleViewLead = () => {
    if (selectedLead) {
      navigate(`/${localStorage.getItem('subdomain')}/leads/view-leads`, {
        state: { tableId: selectedLead.LeadId }
      });
      setActiveMenuId(null);
    }
  };

  // Handle Convert Customer
  const handleConvertCustomer = () => {
    if (selectedLead) {
      setSearchParams({
        modal: "convert-customer",
        LeadId: selectedLead.LeadId
      });
      setActiveMenuId(null);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="w-full h-full p-4 flex flex-col bg-[#F8FAFC]">
      {/* HEADER / FILTERS - Compact like Grid View */}
      <div className="sticky top-0 z-20 bg-[#F8FAFC] pb-4 space-y-3">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, company, Lead ID, status..."
            className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          />
          {searchTerm && (
            <button
              onClick={clearFilters}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Priority Filters - Compact */}
          <div className="flex items-center gap-1.5 bg-white rounded-lg border border-slate-200 p-1">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  setPriorityFilter(
                    priorityFilter === opt.value ? "" : opt.value
                  )
                }
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  priorityFilter === opt.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Lead Status Filter - Compact */}
          <select
            value={leadStatusFilter}
            onChange={(e) => setLeadStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
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
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Results Count */}
        {searchTerm && (
          <div className="text-xs text-slate-500">
            Found {filteredLeads.length} result{filteredLeads.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* KANBAN BOARD */}
      {loading && localLeads.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          Loading board...
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4 -mr-2 pr-2">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 items-start h-full min-h-[500px]">
              {/* Render Columns based on Status Options */}
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
                        className={`min-w-[280px] w-[280px] rounded-xl flex flex-col transition-all duration-300 ${
                          snapshot.isDraggingOver 
                            ? isWonColumn 
                              ? 'bg-green-50 ring-2 ring-green-400' 
                              : isLostColumn 
                                ? 'bg-red-50 ring-2 ring-red-400'
                                : 'bg-slate-100 ring-2 ring-indigo-400'
                            : 'bg-slate-50'
                        }`}
                      >
                        {/* Column Header - Compact */}
                        <div className="sticky top-0 bg-inherit rounded-t-xl p-3 border-b border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: status.color || "#ccc" }}
                              />
                              <h3 className={`font-semibold text-sm ${
                                isWonColumn ? 'text-green-700' : isLostColumn ? 'text-red-700' : 'text-slate-700'
                              }`}>
                                {status.statusName}
                              </h3>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isWonColumn ? 'bg-green-100 text-green-700' : 
                              isLostColumn ? 'bg-red-100 text-red-700' : 
                              'bg-slate-200 text-slate-600'
                            }`}>
                              {columnLeads.length}
                            </span>
                          </div>
                        </div>

                        {/* Scrollable Cards Container - Fixed Height */}
                        <div 
                          className="flex flex-col gap-2 p-3 max-h-[calc(100vh-280px)] overflow-y-auto"
                        >
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
                                  className={`relative p-3 rounded-lg border group hover:shadow-md transition-all ${
                                    isWonColumn 
                                      ? 'border-green-200 bg-green-50/50 hover:bg-green-50' 
                                      : isLostColumn 
                                        ? 'border-red-200 bg-red-50/50 hover:bg-red-50'
                                        : 'border-slate-200 bg-white hover:border-indigo-200'
                                  } ${
                                    snapshot.isDragging
                                      ? "shadow-lg scale-[1.02] rotate-1 z-50 ring-2 ring-indigo-400"
                                      : ""
                                  }`}
                                  style={{ ...provided.draggableProps.style }}
                                >
                                  {/* Menu Button */}
                                  <button
                                    onClick={(e) => handleOpenMenu(e, lead)}
                                    className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-100 z-10"
                                  >
                                    <MoreVertical size={14} className="text-slate-500" />
                                  </button>

                                  {/* Header - Compact */}
                                  <div className="flex items-start gap-2 mb-2 pr-6">
                                    <div
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                      style={{ backgroundColor: lead.leadstatus?.color || '#6366f1' }}
                                    >
                                      {lead.manualData?.name?.charAt(0) || 'L'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-slate-800 text-xs mb-0.5 truncate">
                                        {lead.manualData?.name || "Unknown Lead"}
                                      </h4>
                                      <p className="text-indigo-500 text-[10px] font-medium truncate">
                                        {lead.LeadId}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Details - Compact */}
                                  <div className="space-y-1 mb-2">
                                    <div className="text-[10px] text-slate-600 truncate">
                                      <span className="font-medium">Email:</span> {lead.manualData?.email || "N/A"}
                                    </div>
                                    <div className="text-[10px] text-slate-600 truncate">
                                      <span className="font-medium">Mobile:</span> {lead.manualData?.mobileNo || "N/A"}
                                    </div>
                                    <div className="text-[10px] text-slate-600 truncate">
                                      <span className="font-medium">Company:</span> {lead.manualData?.company || "N/A"}
                                    </div>
                                  </div>

                                  {/* Footer - Compact */}
                                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                                    <span
                                      className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                                      style={{
                                        backgroundColor: `${lead.leadstatus?.color}15`,
                                        color: lead.leadstatus?.color
                                      }}
                                    >
                                      {lead.leadstatus?.statusName?.substring(0, 12)}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-medium">
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
                            <div className="text-center py-6 text-xs text-slate-400">
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
                              color: isWonColumn ? '#166534' : '#991b1b'
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

      {/* PORTAL FOR THE DROPDOWN MENU - Compact */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeMenuId !== null && selectedLead && (
            <>
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setActiveMenuId(null)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                style={{
                  position: 'fixed',
                  top: menuPosition.top,
                  left: menuPosition.left,
                  zIndex: 9999
                }}
                className="w-[200px] bg-white rounded-xl shadow-xl border border-slate-100 p-1 py-2"
              >
                <button
                  onClick={handleEditLead}
                  className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-all text-xs font-semibold text-left"
                >
                  <Pencil size={14} className="text-slate-400" /> Edit lead
                </button>

                <button
                  onClick={handleAddFollowUp}
                  className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-all text-xs font-semibold text-left"
                >
                  <Calendar size={14} className="text-slate-400" /> Add Follow-Up
                </button>

                <button
                  onClick={handleViewLead}
                  className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-all text-xs font-semibold text-left"
                >
                  <Eye size={14} className="text-slate-400" /> View Lead
                </button>

                <div className="my-1 mx-2 border-t border-slate-100" />

                <button
                  onClick={handleConvertCustomer}
                  className="w-full flex items-center gap-3 px-3 py-2 text-slate-800 hover:bg-slate-50 rounded-lg transition-all text-xs font-bold text-left"
                >
                  <Users size={14} className="text-slate-400" /> Convert Customer
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