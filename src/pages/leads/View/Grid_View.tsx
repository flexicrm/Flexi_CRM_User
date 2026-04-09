import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Calendar, Eye, Mail, MoreVertical, Pencil, Phone, Search, Users, X } from 'lucide-react';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface GridViewProps {
  data: any[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const Grid_View = ({ data, selectedIds, setSelectedIds }: GridViewProps) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const handleOpenMenu = (e: React.MouseEvent, lead: any) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.right + window.scrollX - 220,
    });
    setSelectedLead(lead);
    setActiveMenuId(lead._id);
  };

  const toggleSelection = (leadId: string) => {
    setSelectedIds(prev => 
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  // Helper function to get all assignees
  const getAssignees = (lead: any) => {
    if (!lead?.assignTo || lead.assignTo.length === 0) {
      return [{ firstLetter: 'U', fullName: 'Unassigned' }];
    }
    return lead.assignTo.map((assignee: any) => ({
      firstLetter: assignee.firstname?.charAt(0).toUpperCase() || '?',
      fullName: `${assignee.firstname || ''} ${assignee.lastname || ''}`.trim() || 'Unknown User'
    }));
  };

  // Global search filter
  const filteredData = data.filter((lead) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Search in various fields
    const searchableFields = [
      lead.manualData?.name,
      lead.manualData?.email,
      lead.manualData?.mobileNo,
      lead.manualData?.company,
      lead.manualData?.jobTitle,
      lead.leadsource,
      lead.leadstatus?.statusName,
      lead.followUps?.slice(-1)[0]?.priority,
      ...(lead.assignTo?.map((a: any) => `${a.firstname || ''} ${a.lastname || ''}`) || [])
    ];
    
    return searchableFields.some(field => 
      field && field.toString().toLowerCase().includes(searchLower)
    );
  });

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Get current visible data (limited to 2 rows for demo - adjust as needed)
  const visibleData = filteredData;

  return (
    <div className="space-y-4">
      {/* Global Search Bar */}
      <div className="sticky top-0 z-20 bg-[#F8FAFC] py-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, company, source, status, priority, assignee..."
            className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="text-xs text-slate-500 mt-2">
            Found {visibleData.length} result{visibleData.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Grid Container with Fixed Height and Overflow */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
          {visibleData.map((lead, idx) => {
            const isSelected = selectedIds.includes(lead.LeadId);
            
            // Extracting Data Safely
            const firstLetter = lead.manualData?.name?.charAt(0) || 'L';
            const source = lead.leadsource || 'Offline';
            const status = lead.leadstatus?.statusName || 'Unknown';
            const priorityColor = lead.followUps?.slice(-1)[0]?.priority === 'high' ? 'bg-red-500' : lead.followUps?.slice(-1)[0]?.priority === 'low' ? 'bg-green-500' : 'bg-orange-500';
            const priority = lead.followUps?.slice(-1)[0]?.priority || 'Medium';
            
            const assignees = getAssignees(lead);
            const hasMultipleAssignees = assignees.length > 1;

            return (
              <motion.div
                key={lead._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => toggleSelection(lead.LeadId)}
                className={`bg-white rounded-xl p-3 border cursor-pointer shadow-sm hover:shadow-md transition-all group relative h-[180px] flex flex-col ${
                  isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'
                }`}
              >
                {/* Checkbox Overlay */}
                <div className={`absolute top-2 left-2 z-10 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => toggleSelection(lead.LeadId)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" 
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Header: Avatar, Name, Options */}
                <div className="flex items-center justify-between mb-2 pl-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-[#0d1954] font-black text-sm">
                      {firstLetter}
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm truncate max-w-[120px]">
                      {lead.manualData?.name || 'Unknown Name'}
                    </h3>
                  </div>
                  <button 
                    onClick={(e) => handleOpenMenu(e, lead)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>

                {/* Body: Details aligned to screenshot - Compact */}
                <div className="space-y-1.5 mb-2 pl-6 flex-1">
                  {/* Company & Source */}
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Building2 size={12} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{lead.manualData?.company || 'No Company'}</span>
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap">
                      {source}
                    </span>
                  </div>
                  
                  {/* Email */}
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Mail size={12} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{lead.manualData?.email || 'No Email'}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Phone size={12} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{lead.manualData?.mobileNo || 'No Mobile'}</span>
                  </div>
                </div>

                {/* Footer tags area - Compact */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                  <div className="flex items-center gap-3">
                    {/* Lead Status */}
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lead.leadstatus?.color || '#3b82f6' }}></span>
                        <span className="text-[9px] font-bold" style={{ color: lead.leadstatus?.color || '#3b82f6' }}>{status}</span>
                      </div>
                      <span className="text-[8px] text-slate-400 font-medium">Status</span>
                    </div>

                    {/* Priority */}
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityColor}`}></span>
                        <span className={`text-[9px] font-bold capitalize ${
                          priority === 'high' ? 'text-red-500' : priority === 'low' ? 'text-green-500' : 'text-orange-500'
                        }`}>{priority}</span>
                      </div>
                      <span className="text-[8px] text-slate-400 font-medium">Priority</span>
                    </div>
                  </div>
                  
                  {/* Assigned Users Section - Compact */}
                  <div className="relative group/assignee">
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-0.5">
                        {assignees.slice(0, 2).map((assignee: any, index: number) => (
                          <div
                            key={index}
                            className="relative group/assignee-item"
                          >
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[9px] font-bold hover:bg-indigo-100 hover:text-indigo-600 transition-colors cursor-help">
                              {assignee.firstLetter}
                            </div>
                            
                            {/* Tooltip for each assignee */}
                            {assignee.fullName && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 invisible group-hover/assignee-item:opacity-100 group-hover/assignee-item:visible transition-all duration-200 z-10 pointer-events-none">
                                {assignee.fullName}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-3 border-t-gray-900"></div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Show +X for more assignees */}
                        {assignees.length > 2 && (
                          <div className="relative group/assignee-item">
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[8px] font-bold hover:bg-indigo-100 hover:text-indigo-600 transition-colors cursor-help">
                              +{assignees.length - 2}
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 invisible group-hover/assignee-item:opacity-100 group-hover/assignee-item:visible transition-all duration-200 z-10 pointer-events-none">
                              {assignees.slice(2).map((a: any) => a.fullName).join(', ')}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-3 border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[8px] text-slate-400 font-medium">
                        {assignees.length === 1 ? 'Assigned' : `Assigned (${assignees.length})`}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {visibleData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No leads found</h3>
            <p className="text-sm text-slate-500">
              {searchTerm ? `No results matching "${searchTerm}"` : 'No leads available'}
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-700"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* PORTAL FOR DROPDOWN MENU */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeMenuId !== null && (
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setActiveMenuId(null)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left, zIndex: 9999 }}
                className="w-[200px] bg-white rounded-xl shadow-xl border border-slate-100 p-1 py-2"
              >
                <button 
                  onClick={() => { 
                    navigate(`/${localStorage.getItem('subdomain')}/leads/create-leads`, { 
                      state: { tableData: selectedLead, tableId: selectedLead.LeadId }
                    }); 
                    setActiveMenuId(null); 
                  }} 
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-all text-xs font-semibold text-left"
                >
                  <Pencil size={14} className="text-slate-400" /> Edit lead
                </button>
                <button 
                  onClick={() => { 
                    setSearchParams({ modal: "schedule-followup", LeadId: selectedLead.LeadId }); 
                    setActiveMenuId(null); 
                  }} 
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-all text-xs font-semibold text-left"
                >
                  <Calendar size={14} className="text-slate-400" /> Add Follow-Up
                </button>
                <button 
                  onClick={() => { 
                    navigate(`/${localStorage.getItem('subdomain')}/leads/view-leads`, { 
                      state: { tableId: selectedLead.LeadId }
                    }); 
                    setActiveMenuId(null); 
                  }} 
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-all text-xs font-semibold text-left"
                >
                  <Eye size={14} className="text-slate-400" /> View Lead
                </button>
                <div className="my-1 mx-2 border-t border-slate-100" />
                <button 
                  onClick={() => { 
                    setSearchParams({ modal: "convert-customer", LeadId: selectedLead.LeadId }); 
                    setActiveMenuId(null); 
                  }} 
                  className="w-full flex items-center gap-2 px-3 py-2 text-[#0f172a] hover:bg-slate-50 rounded-lg transition-all text-xs font-black text-left"
                >
                  <Users size={14} className="text-slate-400" /> Convert Customer
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

export default Grid_View;