import { AnimatePresence, motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, X } from 'lucide-react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import Reusable_Button from '../../component/button/Reusable_Button';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  selectedIds: string[];
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, data, selectedIds }) => {
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  const [exportType, setExportType] = useState<'all' | 'selected'>(selectedIds.length > 0 ? 'selected' : 'all');

  // Theme-based styles
  const getModalBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getModalBorder = () => darkMode ? 'border-gray-700' : 'border-slate-100';
  const getTitleColor = () => darkMode ? 'text-white' : 'text-[#0d1954]';
  const getIconBg = () => darkMode ? 'bg-gray-700' : 'bg-indigo-50';
  const getIconColor = () => darkMode ? primaryColor || '#818CF8' : '#6366f1';
  const getCloseButtonColor = () => darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-slate-400 hover:bg-slate-50';
  const getLabelColor = () => darkMode ? 'text-gray-300' : 'text-slate-700';
  const getOptionBg = (isSelected: boolean) => {
    if (isSelected) {
      return darkMode ? `border-${primaryColor}-500 bg-${primaryColor}/10` : 'border-indigo-600 bg-indigo-50/50';
    }
    return darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-slate-100 hover:border-slate-200';
  };
  const getOptionTitleColor = () => darkMode ? 'text-white' : 'text-[#0d1954]';
  const getOptionSubtextColor = () => darkMode ? 'text-gray-500' : 'text-slate-500';
  const getDisabledOptionBg = () => darkMode ? 'bg-gray-800 border-gray-700 opacity-50' : 'bg-slate-50 border-slate-100 opacity-50';

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

  const isSelectedDisabled = selectedIds.length === 0;

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
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-3xl shadow-2xl z-[9999] overflow-hidden ${getModalBg()}`}
          >
            <div className={`flex items-center justify-between p-6 border-b ${getModalBorder()}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${getIconBg()}`}>
                  <Download size={20} style={{ color: getIconColor() }} />
                </div>
                <h2 className={`text-xl font-black ${getTitleColor()}`}>Export Leads</h2>
              </div>
              <button 
                onClick={onClose} 
                className={`p-2 rounded-full transition-colors ${getCloseButtonColor()}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className={`text-sm font-bold ${getLabelColor()}`}>Which data would you like to export?</label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setExportType('all')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${getOptionBg(exportType === 'all')}`}
                  >
                    <p className={`font-bold ${getOptionTitleColor()}`}>All Records</p>
                    <p className={`text-xs font-medium mt-1 ${getOptionSubtextColor()}`}>
                      Export {data.length} total leads
                    </p>
                  </div>
                  <div 
                    onClick={() => !isSelectedDisabled && setExportType('selected')}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isSelectedDisabled 
                        ? getDisabledOptionBg()
                        : `cursor-pointer ${getOptionBg(exportType === 'selected')}`
                    }`}
                  >
                    <p className={`font-bold ${getOptionTitleColor()}`}>Selected</p>
                    <p className={`text-xs font-medium mt-1 ${getOptionSubtextColor()}`}>
                      {selectedIds.length} leads selected
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Reusable_Button 
                  text="Export CSV"
                  variant="ghost"
                  icon={<FileText size={18} />}
                  onClick={handleExportCSV}
                  className="w-full justify-center font-bold py-3"
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