import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Calendar, Eye, Mail, MoreVertical, Pencil, Phone, Search, Users, X } from 'lucide-react';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface GridViewProps {
  data: any[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const Grid_View = ({ data, selectedIds, setSelectedIds }: GridViewProps) => {
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
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

  // Get theme-based styles
  const getPageBg = () => darkMode ? 'bg-gray-900' : 'bg-[#F8FAFC]';
  const getSearchInputBg = () => darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-slate-200';
  const getSearchTextColor = () => darkMode ? 'text-gray-400' : 'text-slate-400';
  const getResultTextColor = () => darkMode ? 'text-gray-500' : 'text-slate-500';
  const getCardBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getCardBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200';
  const getCardHoverShadow = () => darkMode ? 'hover:shadow-gray-800' : 'hover:shadow-md';
  const getCardSelectedBorder = () => darkMode ? `ring-1 ring-${primaryColor}-500` : `border-${primaryColor}-500 ring-1 ring-${primaryColor}-500`;
  const getAvatarBg = () => darkMode ? 'bg-gray-700' : 'bg-slate-100';
  const getAvatarTextColor = () => darkMode ? 'text-gray-200' : 'text-[#0d1954]';
  const getNameColor = () => darkMode ? 'text-gray-200' : 'text-slate-800';
  const getIconColor = () => darkMode ? 'text-gray-500' : 'text-slate-400';
  const getTextColor = () => darkMode ? 'text-gray-300' : 'text-slate-500';
  const getSourceBg = () => darkMode ? 'bg-gray-700 text-gray-300' : 'bg-slate-100 text-slate-600';
  const getBorderTop = () => darkMode ? 'border-gray-700' : 'border-slate-100';
  const getStatusDotColor = (color: string) => color || '#3b82f6';
  const getPriorityColor = (priority: string) => {
    if (darkMode) {
      return priority === 'high' ? 'text-red-400' : priority === 'low' ? 'text-green-400' : 'text-orange-400';
    }
    return priority === 'high' ? 'text-red-500' : priority === 'low' ? 'text-green-500' : 'text-orange-500';
  };
  const getPriorityDotColor = (priority: string) => {
    return priority === 'high' ? 'bg-red-500' : priority === 'low' ? 'bg-green-500' : 'bg-orange-500';
  };
  const getAssigneeBg = () => darkMode ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-slate-200 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600';
  const getMenuBg = () => darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100';
  const getMenuTextColor = () => darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-slate-700 hover:bg-slate-50';
  const getMenuIconColor = () => darkMode ? 'text-gray-500' : 'text-slate-400';
  const getDividerColor = () => darkMode ? 'border-gray-700' : 'border-slate-100';

  // Global search filter
  const filteredData = data.filter((lead) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
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

  const clearSearch = () => {
    setSearchTerm('');
  };

  const visibleData = filteredData;

  return (
    <div className={`space-y-4 ${getPageBg()}`}>
      {/* Global Search Bar */}
      <div className="sticky top-0 z-20 py-3" style={{ backgroundColor: darkMode ? '#111827' : '#F8FAFC' }}>
        <div className="relative max-w-md">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${getSearchTextColor()}`} size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, company, source, status, priority, assignee..."
            className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${getSearchInputBg()}`}
            style={
  {
    '--tw-ring-color': `${primaryColor}20`
  } as React.CSSProperties
}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${getSearchTextColor()} hover:${darkMode ? 'text-gray-300' : 'text-slate-600'}`}
            >
              <X size={16} />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className={`text-xs mt-2 ${getResultTextColor()}`}>
            Found {visibleData.length} result{visibleData.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Grid Container with Fixed Height and Overflow */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
          {visibleData.map((lead, idx) => {
            const isSelected = selectedIds.includes(lead.LeadId);
            
            const firstLetter = lead.manualData?.name?.charAt(0) || 'L';
            const source = lead.leadsource || 'Offline';
            const status = lead.leadstatus?.statusName || 'Unknown';
            const priority = lead.followUps?.slice(-1)[0]?.priority || 'Medium';
            
            const assignees = getAssignees(lead);

            return (
              <motion.div
                key={lead._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => toggleSelection(lead.LeadId)}
                className={`${getCardBg()} rounded-xl p-3 cursor-pointer shadow-sm transition-all group relative h-[180px] flex flex-col ${getCardHoverShadow()} ${
                  isSelected ? getCardSelectedBorder() : getCardBorder()
                }`}
              >
                {/* Checkbox Overlay */}
                <div className={`absolute top-2 left-2 z-10 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => toggleSelection(lead.LeadId)}
                    className="w-4 h-4 rounded focus:ring-offset-0 cursor-pointer"
                    style={{ accentColor: primaryColor || '#6366f1' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Header: Avatar, Name, Options */}
                <div className="flex items-center justify-between mb-2 pl-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${getAvatarBg()} ${getAvatarTextColor()}`}>
                      {firstLetter}
                    </div>
                    <h3 className={`font-bold text-sm truncate max-w-[120px] ${getNameColor()}`}>
                      {lead.manualData?.name || 'Unknown Name'}
                    </h3>
                  </div>
                  <button 
                    onClick={(e) => handleOpenMenu(e, lead)}
                    className={`p-1 rounded-full transition-all ${getIconColor()} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>

                {/* Body: Details aligned to screenshot - Compact */}
                <div className="space-y-1.5 mb-2 pl-6 flex-1">
                  {/* Company & Source */}
                  <div className={`flex items-center gap-2 text-xs ${getTextColor()}`}>
                    <Building2 size={12} className={`flex-shrink-0 ${getIconColor()}`} />
                    <span className="truncate">{lead.manualData?.company || 'No Company'}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${getSourceBg()}`}>
                      {source}
                    </span>
                  </div>
                  
                  {/* Email */}
                  <div className={`flex items-center gap-2 text-xs ${getTextColor()}`}>
                    <Mail size={12} className={`flex-shrink-0 ${getIconColor()}`} />
                    <span className="truncate">{lead.manualData?.email || 'No Email'}</span>
                  </div>

                  {/* Phone */}
                  <div className={`flex items-center gap-2 text-xs ${getTextColor()}`}>
                    <Phone size={12} className={`flex-shrink-0 ${getIconColor()}`} />
                    <span className="truncate">{lead.manualData?.mobileNo || 'No Mobile'}</span>
                  </div>
                </div>

                {/* Footer tags area - Compact */}
                <div className={`flex items-center justify-between pt-2 border-t mt-auto ${getBorderTop()}`}>
                  <div className="flex items-center gap-3">
                    {/* Lead Status */}
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusDotColor(lead.leadstatus?.color) }}></span>
                        <span className="text-[9px] font-bold" style={{ color: getStatusDotColor(lead.leadstatus?.color) }}>{status}</span>
                      </div>
                      <span className="text-[8px] font-medium" style={{ color: darkMode ? '#6b7280' : '#94a3b8' }}>Status</span>
                    </div>

                    {/* Priority */}
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDotColor(priority)}`}></span>
                        <span className={`text-[9px] font-bold capitalize ${getPriorityColor(priority)}`}>{priority}</span>
                      </div>
                      <span className="text-[8px] font-medium" style={{ color: darkMode ? '#6b7280' : '#94a3b8' }}>Priority</span>
                    </div>
                  </div>
                  
                  {/* Assigned Users Section - Compact */}
                  <div className="relative group/assignee">
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-0.5">
                        {assignees.slice(0, 2).map((assignee: any, index: number) => (
                          <div key={index} className="relative group/assignee-item">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors cursor-help ${getAssigneeBg()}`}>
                              {assignee.firstLetter}
                            </div>
                            
                            {assignee.fullName && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 invisible group-hover/assignee-item:opacity-100 group-hover/assignee-item:visible transition-all duration-200 z-10 pointer-events-none">
                                {assignee.fullName}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-3 border-t-gray-900"></div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {assignees.length > 2 && (
                          <div className="relative group/assignee-item">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-colors cursor-help ${getAssigneeBg()}`}>
                              +{assignees.length - 2}
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 invisible group-hover/assignee-item:opacity-100 group-hover/assignee-item:visible transition-all duration-200 z-10 pointer-events-none">
                              {assignees.slice(2).map((a: any) => a.fullName).join(', ')}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-3 border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[8px] font-medium" style={{ color: darkMode ? '#6b7280' : '#94a3b8' }}>
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
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-gray-800' : 'bg-slate-100'}`}>
              <Search size={32} className={darkMode ? 'text-gray-600' : 'text-slate-400'} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              No leads found
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>
              {searchTerm ? `No results matching "${searchTerm}"` : 'No leads available'}
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="mt-4 text-sm font-medium transition-colors"
                style={{ color: primaryColor || '#6366f1' }}
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
                className={`w-[200px] rounded-xl shadow-xl border p-1 py-2 ${getMenuBg()}`}
              >
                <button 
                  onClick={() => { 
                    navigate(`/${localStorage.getItem('subdomain')}/leads/create-leads`, { 
                      state: { tableData: selectedLead, tableId: selectedLead.LeadId }
                    }); 
                    setActiveMenuId(null); 
                  }} 
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-semibold text-left ${getMenuTextColor()}`}
                >
                  <Pencil size={14} className={getMenuIconColor()} /> Edit lead
                </button>
                <button 
                  onClick={() => { 
                    setSearchParams({ modal: "schedule-followup", LeadId: selectedLead.LeadId }); 
                    setActiveMenuId(null); 
                  }} 
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-semibold text-left ${getMenuTextColor()}`}
                >
                  <Calendar size={14} className={getMenuIconColor()} /> Add Follow-Up
                </button>
                <button 
                  onClick={() => { 
                    navigate(`/${localStorage.getItem('subdomain')}/leads/view-leads`, { 
                      state: { tableId: selectedLead.LeadId }
                    }); 
                    setActiveMenuId(null); 
                  }} 
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-semibold text-left ${getMenuTextColor()}`}
                >
                  <Eye size={14} className={getMenuIconColor()} /> View Lead
                </button>
                <div className={`my-1 mx-2 border-t ${getDividerColor()}`} />
                <button 
                  onClick={() => { 
                    setSearchParams({ modal: "convert-customer", LeadId: selectedLead.LeadId }); 
                    setActiveMenuId(null); 
                  }} 
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-bold text-left ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-slate-800 hover:bg-slate-50'}`}
                >
                  <Users size={14} className={getMenuIconColor()} /> Convert Customer
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