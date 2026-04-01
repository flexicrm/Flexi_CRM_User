import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Calendar, Eye, Mail, MoreVertical, Pencil, Phone, User, Users } from 'lucide-react';
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
      {data.map((lead, idx) => {
        const isSelected = selectedIds.includes(lead.LeadId);
        
        // Extracting Data Safely
        const firstLetter = lead.manualData?.name?.charAt(0) || 'L';
        const source = lead.leadsource || 'Offline';
        const status = lead.leadstatus?.statusName || 'Unknown';
        const priorityColor = lead.followUps?.slice(-1)[0]?.priority === 'high' ? 'bg-red-500' : lead.followUps?.slice(-1)[0]?.priority === 'low' ? 'bg-green-500' : 'bg-orange-500';
        const priority = lead.followUps?.slice(-1)[0]?.priority || 'Medium';

        return (
          <motion.div
            key={lead._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            onClick={() => toggleSelection(lead.LeadId)}
            className={`bg-white rounded-2xl p-5 border cursor-pointer shadow-sm hover:shadow-lg transition-all group relative ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'}`}
          >
            {/* Checkbox Overlay */}
            <div className={`absolute top-4 left-4 z-10 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
               <input 
                 type="checkbox" 
                 checked={isSelected} 
                 onChange={() => toggleSelection(lead.LeadId)}
                 className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" 
                 onClick={(e) => e.stopPropagation()}
               />
            </div>

            {/* Header: Avatar, Name, Options */}
            <div className="flex items-center justify-between mb-4 pl-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-[#0d1954] font-black text-lg">
                  {firstLetter}
                </div>
                <h3 className="font-bold text-slate-800 text-base truncate max-w-[140px]">
                  {lead.manualData?.name || 'Unknown Name'}
                </h3>
              </div>
              <button 
                onClick={(e) => handleOpenMenu(e, lead)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Body: Details aligned to screenshot */}
            <div className="space-y-3 mb-6 pl-1 ml-[18px]">
              {/* Company & Source */}
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Building2 size={16} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{lead.manualData?.company || 'No Company'}</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap">
                  {source}
                </span>
              </div>
              
              {/* Email */}
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Mail size={16} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{lead.manualData?.email || 'No Email'}</span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Phone size={16} className="text-slate-400 flex-shrink-0" />
                <span>{lead.manualData?.mobileNo || 'No Mobile'}</span>
              </div>
            </div>

            {/* Footer tags area */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-4">
                 {/* Lead Status */}
                 <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-1.5">
                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lead.leadstatus?.color || '#3b82f6' }}></span>
                     <span className="text-[11px] font-bold" style={{ color: lead.leadstatus?.color || '#3b82f6' }}>{status}</span>
                   </div>
                   <span className="text-[10px] text-slate-400 font-medium">Lead Status</span>
                 </div>

                 {/* Priority */}
                 <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-1.5">
                     <span className={`w-2 h-2 rounded-full ${priorityColor}`}></span>
                     <span className={`text-[11px] font-bold text-orange-500 capitalize`}>{priority}</span>
                   </div>
                   <span className="text-[10px] text-slate-400 font-medium">Priority</span>
                 </div>
              </div>
              
              {/* Assigned Icon */}
              <div className="flex flex-col items-end gap-1">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                   <User size={12} />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Assigned</span>
              </div>
            </div>
          </motion.div>
        );
      })}

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
                className="w-[220px] bg-white rounded-2xl shadow-xl border border-slate-100 p-2 py-3"
              >
                <button onClick={() => { navigate(`/${localStorage.getItem('subdomain')}/leads/create-leads`, { state: { tableData: selectedLead, tableId: selectedLead.LeadId }}); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 rounded-xl transition-all text-sm font-semibold text-left">
                  <Pencil size={16} className="text-slate-400" /> Edit lead
                </button>
                <button onClick={() => { setSearchParams({ modal: "schedule-followup", LeadId: selectedLead.LeadId }); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 rounded-xl transition-all text-sm font-semibold text-left">
                  <Calendar size={16} className="text-slate-400" /> Add Follow-Up
                </button>
                <button onClick={() => { navigate(`/${localStorage.getItem('subdomain')}/leads/view-leads`, { state: { tableId: selectedLead.LeadId }}); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 rounded-xl transition-all text-sm font-semibold text-left">
                  <Eye size={16} className="text-slate-400" /> View Lead
                </button>
                <div className="my-1.5 mx-3 border-t border-slate-100" />
                <button onClick={() => { setSearchParams({ modal: "convert-customer", LeadId: selectedLead.LeadId }); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[#0f172a] hover:bg-slate-50 rounded-xl transition-all text-sm font-black text-left">
                  <Users size={16} className="text-slate-400" /> Convert Customer
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