import { AnimatePresence, motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, X } from 'lucide-react';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Reusable_Button from '../../component/button/Reusable_Button';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  selectedIds: string[];
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, data, selectedIds }) => {
  const [exportType, setExportType] = useState<'all' | 'selected'>(selectedIds.length > 0 ? 'selected' : 'all');

  // Format data for export
  const getFormattedData = () => {
    const dataToExport = exportType === 'selected' && selectedIds.length > 0
      ? data.filter(lead => selectedIds.includes(lead.LeadId))
      : data;

    return dataToExport.map(lead => ({
      'Lead ID': lead.LeadId || 'N/A',
      'Name': lead.manualData?.name || 'N/A',
      'Email': lead.manualData?.email || 'N/A',
      'Phone': lead.manualData?.mobileNo || 'N/A',
      'Company': lead.manualData?.company || 'N/A',
      'Source': lead.leadsource || 'N/A',
      'Status': lead.leadstatus?.statusName || 'N/A',
      'Created Date': new Date(lead.createdAt).toLocaleDateString(),
    }));
  };

  const handleExportCSV = () => {
    const exportData = getFormattedData();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Leads_Export_${new Date().getTime()}.csv`;
    link.click();
    onClose();
  };

  const handleExportExcel = () => {
    const exportData = getFormattedData();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    
    XLSX.writeFile(workbook, `Leads_Export_${new Date().getTime()}.xlsx`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[9999] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Download size={20} />
                </div>
                <h2 className="text-xl font-black text-[#0d1954]">Export Leads</h2>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Which data would you like to export?</label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setExportType('all')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${exportType === 'all' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <p className="font-bold text-[#0d1954]">All Records</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Export {data.length} total leads</p>
                  </div>
                  <div 
                    onClick={() => selectedIds.length > 0 && setExportType('selected')}
                    className={`p-4 rounded-2xl border-2 transition-all ${selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed border-slate-100 bg-slate-50' : 'cursor-pointer'} ${exportType === 'selected' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <p className="font-bold text-[#0d1954]">Selected</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{selectedIds.length} leads selected</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Reusable_Button 
                  text="Export CSV"
                  variant="ghost"
                  icon={<FileText size={18} />}
                  onClick={handleExportCSV}
                  className="w-full justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3"
                />
                <Reusable_Button 
                  text="Export Excel"
                  variant="primary"
                  icon={<FileSpreadsheet size={18} />}
                  onClick={handleExportExcel}
                  className="w-full justify-center py-3"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExportModal;