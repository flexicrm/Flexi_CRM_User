import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Eye, MoreVertical, Pencil, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchLeads, fetchStatuses, updateLeadkanban } from "../../../store/homepage_slice/Leads_slice"; // Adjust path to your slice
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

const Kanban_View = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux State
  const { leadsData, statusOptions, loading, followUpStatuses } = useSelector(
    (state: any) => state.leads
  );

  // Local State
  const [localLeads, setLocalLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("");
  
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
          lead.LeadId?.toLowerCase().includes(lowerSearch)
      );
    }

    // Priority filter
    if (priorityFilter) {
      filtered = filtered.filter(
        (lead) => lead.followUps?.slice(-1)[0]?.priority === priorityFilter
      );
    }

    // Lead Status filter - using leadstatus from the lead object
    if (leadStatusFilter) {
      filtered = filtered.filter(
        (lead) => lead.leadstatus?.statusName?.toLowerCase() === leadStatusFilter.toLowerCase()
      );
    }

    return filtered;
  }, [localLeads, searchTerm, priorityFilter, leadStatusFilter]);

  // Drag and Drop Handler
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a column
    if (!destination) return;

    // Dropped in the same column
    if (source.droppableId === destination.droppableId) return;

    // 1. Optimistic UI Update
    const updatedLeads = localLeads.map((lead) => {
      if (lead.LeadId === draggableId) {
        // Find the new status object from Redux state to assign it locally
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

    // 2. Dispatch API Call
    dispatch(
      updateLeadkanban({
        leadId: draggableId,
        formData: { leadstatusid: destination.droppableId },
      })
    );
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
      left: rect.right + window.scrollX - 220,
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
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full h-full p-4 flex flex-col bg-gray-50">
      {/* HEADER / FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        {/* Left Side: Priority & Lead Status Dropdown */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Priority:</span>
            <div className="flex bg-gray-100 rounded border border-gray-200 p-1">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    setPriorityFilter(
                      priorityFilter === opt.value ? "" : opt.value
                    )
                  }
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    priorityFilter === opt.value
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Lead Status:</span>
            <select
              value={leadStatusFilter}
              onChange={(e) => setLeadStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Statuses</option>
              {statusOptions?.map((status: any) => (
                <option key={status._id} value={status.statusName}>
                  {status.statusName}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || priorityFilter || leadStatusFilter) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Right Side: Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px] pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* KANBAN BOARD */}
      {loading && localLeads.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Loading board...
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 items-start h-full min-h-[500px]">
              {/* Render Columns based on Status Options */}
              {statusOptions?.map((status: any) => {
                // Get leads that belong to this column
                const columnLeads = filteredLeads.filter(
                  (lead) => lead.leadstatus?._id === status._id
                );

                return (
                  <Droppable key={status._id} droppableId={status._id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-w-[280px] w-[280px] rounded-lg p-3 flex flex-col transition-colors ${
                          snapshot.isDraggingOver ? "bg-gray-200" : "bg-gray-100"
                        }`}
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: status.color || "#ccc" }}
                            />
                            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                              {status.statusName}
                            </h3>
                          </div>
                          <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                            {columnLeads.length}
                          </span>
                        </div>

                        {/* Draggable Cards */}
                        <div className="flex flex-col gap-3 min-h-[50px]">
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
                                  className={`relative p-4 rounded-lg shadow-sm border border-gray-200 bg-white group hover:border-blue-300 transition-all ${
                                    snapshot.isDragging
                                      ? "shadow-lg scale-105 rotate-1 z-50 ring-2 ring-blue-400"
                                      : ""
                                  }`}
                                  style={{ ...provided.draggableProps.style }}
                                >
                                  {/* Menu Button */}
                                  <button
                                    onClick={(e) => handleOpenMenu(e, lead)}
                                    className="absolute top-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 z-10"
                                  >
                                    <MoreVertical size={16} className="text-gray-500" />
                                  </button>

                                  <div className="flex items-start gap-3 mb-3">
                                    <div
                                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-inner flex-shrink-0"
                                      style={{ backgroundColor: lead.leadstatus?.color || '#6366f1' }}
                                    >
                                      {lead.manualData?.name?.charAt(0) || 'L'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-800 text-sm mb-1 truncate">
                                        {lead.manualData?.name || "Unknown Lead"}
                                      </h4>
                                      <p className="text-indigo-500 text-xs font-bold">
                                        {lead.LeadId}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-2 mb-3">
                                    <div className="text-xs text-gray-600 truncate">
                                      <span className="font-medium">Email:</span> {lead.manualData?.email || "N/A"}
                                    </div>
                                    <div className="text-xs text-gray-600 truncate">
                                      <span className="font-medium">Mobile:</span> {lead.manualData?.mobileNo || "N/A"}
                                    </div>
                                    <div className="text-xs text-gray-600 truncate">
                                      <span className="font-medium">Company:</span> {lead.manualData?.company || "N/A"}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <span
                                      className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                                      style={{
                                        backgroundColor: `${lead.leadstatus?.color}15`,
                                        color: lead.leadstatus?.color
                                      }}
                                    >
                                      {lead.leadstatus?.statusName}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                      {formatDate(lead.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* PORTAL FOR THE DROPDOWN MENU - CRUD Operations */}
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
                className="w-[220px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 p-2 py-3"
              >
                <button
                  onClick={handleEditLead}
                  className="w-full flex items-center gap-4 px-4 py-3 text-[#1e293b] hover:bg-slate-50 rounded-2xl transition-all text-[15px] font-semibold text-left"
                >
                  <Pencil size={18} className="text-slate-400" /> Edit lead
                </button>

                <button
                  onClick={handleAddFollowUp}
                  className="w-full flex items-center gap-4 px-4 py-3 text-[#1e293b] hover:bg-slate-50 rounded-2xl transition-all text-[15px] font-semibold text-left"
                >
                  <Calendar size={18} className="text-slate-400" /> Add Follow-Up
                </button>

                <button
                  onClick={handleViewLead}
                  className="w-full flex items-center gap-4 px-4 py-3 text-[#1e293b] hover:bg-slate-50 rounded-2xl transition-all text-[15px] font-semibold text-left"
                >
                  <Eye size={18} className="text-slate-400" /> View Lead
                </button>

                <div className="my-2 mx-3 border-t border-slate-50" />

                <button
                  onClick={handleConvertCustomer}
                  className="w-full flex items-center gap-4 px-4 py-3 text-[#0f172a] hover:bg-slate-50 rounded-2xl transition-all text-[15px] font-black text-left"
                >
                  <Users size={18} className="text-slate-400" /> Convert Customer
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Kanban_View;