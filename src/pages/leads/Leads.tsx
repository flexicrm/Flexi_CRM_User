import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowUpFromLine,
  Kanban,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Target,
  Upload
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RippleLoader from '../../component/Loader/RippleLoader';
import { errorAlert, successAlert } from '../../component/Notification/statusHandler';
import Reusable_Button from '../../component/button/Reusable_Button';
import { fetchMeData } from '../../store/Login_Slice';
import { fetchLeads } from '../../store/homepage_slice/Leads_slice';
import Bulk_Upload from './Bulk_Upload';
import ExportModal from './ExportModal';
import Grid_View from './View/Grid_View';
import Table_View from './View/Table_View';
import Kanban_View from './View/kanban_View';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 350, damping: 25 },
  },
};

// --- Tooltip Component with Theme Support ---
const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => {
  const { darkMode } = useSelector((state: any) => state.theme);
  
  return (
    <div className="group relative flex flex-col items-center">
      {children}
      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 animate-in fade-in zoom-in-95 duration-200">
        <span className={`relative z-10 px-2 py-1 text-[10px] font-semibold text-white whitespace-nowrap shadow-md rounded-md ${
          darkMode ? 'bg-gray-800' : 'bg-slate-800'
        }`}>
          {text}
        </span>
        <div className={`w-2 h-2 -mt-1 rotate-45 rounded-sm ${
          darkMode ? 'bg-gray-800' : 'bg-slate-800'
        }`}></div>
      </div>
    </div>
  );
};

// Helper function to extract error message
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Error occurred while fetching leads. Please try again.";
  
  if (error?.response?.data) {
    const responseData = error.response.data;
    
    if (responseData.message) {
      errorMessage = responseData.message;
    } else if (responseData.errors) {
      if (typeof responseData.errors === 'string') {
        errorMessage = responseData.errors;
      } else if (typeof responseData.errors === 'object') {
        const firstErrorKey = Object.keys(responseData.errors)[0];
        if (firstErrorKey && responseData.errors[firstErrorKey]) {
          errorMessage = Array.isArray(responseData.errors[firstErrorKey]) 
            ? responseData.errors[firstErrorKey][0] 
            : responseData.errors[firstErrorKey];
        } else {
          errorMessage = JSON.stringify(responseData.errors);
        }
      }
    } else if (responseData.error) {
      errorMessage = responseData.error;
    }
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
    errorMessage = "Network error. Please check your internet connection.";
  }
  
  return errorMessage;
};

const Leads: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const currentView = searchParams.get('view') || 'table';
  const { leadsData, loading, error } = useSelector((state: any) => state.leads);
  const { permissions } = useSelector((state: any) => state.auth);
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  const Roles = permissions[1];

  // Fetch leads data
  const fetchLeadsData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      }
      await dispatch(fetchLeads()).unwrap();
      if (!isInitialLoad && showRefreshLoader) {
        successAlert("Leads refreshed successfully!", "Great", "Refreshed");
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      if (!isInitialLoad) {
        errorAlert(errorMessage, "Retry", "Load Failed");
      }
    } finally {
      setIsRefreshing(false);
      setIsInitialLoad(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLeadsData(false);
  }, [dispatch]);

  // Fetch me data when component mounts
  useEffect(() => {
    dispatch(fetchMeData() as any);
  }, [dispatch]);

  const handleViewChange = (view: string) => {
    setSearchParams({ view });
  };

  const handleRefresh = () => {
    fetchLeadsData(true);
  };

  // Get theme-based styles
  const getPageBg = () => darkMode ? 'bg-gray-900' : 'bg-[#F8FAFC]';
  const getHeaderIconBg = () => darkMode ? 'bg-gray-700' : 'bg-indigo-100';
  const getHeaderIconColor = () => darkMode ? primaryColor || '#818CF8' : '#6366f1';
  const getTitleColor = () => darkMode ? 'text-white' : 'text-slate-900';
  const getSubtitleColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';
  const getSeparatorColor = () => darkMode ? 'bg-gray-600' : 'bg-slate-300';
  const getCountColor = () => darkMode ? 'text-gray-500' : 'text-slate-500';
  
  const getButtonBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getButtonBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200';
  const getButtonTextColor = () => darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600';
  const getButtonHoverBg = () => darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50';
  
  const getViewSwitcherBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getViewSwitcherBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200';
  const getViewButtonActiveBg = () => darkMode ? 'bg-gray-700' : 'bg-indigo-50';
  const getViewButtonActiveColor = () => darkMode ? primaryColor || '#818CF8' : '#6366f1';
  const getViewButtonInactiveColor = () => darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-slate-400 hover:text-slate-700';
  
  const getMainBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getMainBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200/60';

  const renderView = () => {
    // Don't show error during initial load or refresh
    if (error && !isInitialLoad && !isRefreshing) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            darkMode ? 'bg-red-900/20' : 'bg-rose-50'
          }`}>
            <AlertCircle className={darkMode ? 'text-red-400' : 'text-rose-500'} size={32} />
          </div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
            Failed to load leads
          </h3>
          <p className={`text-sm mt-1 max-w-md ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
            {error}
          </p>
          <button 
            onClick={handleRefresh} 
            className="mt-6 px-4 py-2 rounded-lg transition-colors text-white"
            style={{ backgroundColor: primaryColor || '#6366f1' }}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Retrying..." : "Try Again"}
          </button>
        </div>
      );
    }

    switch (currentView) {
      case 'table': 
        return <Table_View data={leadsData?.leads || []} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />;
      case 'grid': 
        return <Grid_View data={leadsData?.leads || []} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />;
      case 'bulk': 
        return <Bulk_Upload onSuccess={() => handleViewChange('table')} onClose={() => handleViewChange('table')} />;
      case 'kanban': 
        return <Kanban_View />;
      default: 
        return <Table_View data={leadsData?.leads || []} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />;
    }
  };

  // Show full page loader only on initial load
  if (isInitialLoad && loading) {
    return <RippleLoader />;
  }

  return (
    <>
      {/* Show refresh loader overlay when refreshing */}
      {isRefreshing && <RippleLoader />}
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`min-h-screen py-6 px-4 md:py-8 md:px-6 lg:px-8 transition-colors duration-300 ${getPageBg()}`}
      >
        <div className="w-full mx-auto space-y-6">
          
          {/* --- LAYER 1: HERO HEADER --- */}
          <motion.header variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm ${getHeaderIconBg()}`}>
                <Target size={20} strokeWidth={2.5} className="md:w-6 md:h-6" style={{ color: getHeaderIconColor() }} />
              </div>
              <div>
                <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold tracking-tight ${getTitleColor()}`}>
                  Lead Pipeline
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className={`text-xs md:text-sm ${getSubtitleColor()}`}>
                    Track, convert, and manage your prospects.
                  </p>
                  <span className={`w-1 h-1 rounded-full ${getSeparatorColor()}`}></span>
                  <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${getCountColor()}`}>
                    {leadsData?.leadsCount || 0} Total
                  </p>
                </div>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              
              {/* Refresh Button */}
              <Tooltip text="Refresh Data">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`p-2 rounded-lg shadow-sm border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getButtonBg()} ${getButtonBorder()} ${getButtonTextColor()} ${getButtonHoverBg()}`}
                >
                  <Loader2 size={16} className={isRefreshing ? "animate-spin" : ""} />
                </button>
              </Tooltip>

              {/* View Switchers */}
              <div className={`flex items-center p-1 rounded-lg shadow-sm border ${getViewSwitcherBg()} ${getViewSwitcherBorder()}`}>
                <Tooltip text="Table View">
                  <button
                    onClick={() => handleViewChange('table')}
                    className={`p-1.5 rounded-md transition-all ${
                      currentView === 'table' 
                        ? `${getViewButtonActiveBg()} shadow-sm` 
                        : getViewButtonInactiveColor()
                    }`}
                    style={currentView === 'table' ? { color: getViewButtonActiveColor() } : {}}
                    disabled={isRefreshing}
                  >
                    <List size={16} />
                  </button>
                </Tooltip>
                <Tooltip text="Grid View">
                  <button
                    onClick={() => handleViewChange('grid')}
                    className={`p-1.5 rounded-md transition-all ${
                      currentView === 'grid' 
                        ? `${getViewButtonActiveBg()} shadow-sm` 
                        : getViewButtonInactiveColor()
                    }`}
                    style={currentView === 'grid' ? { color: getViewButtonActiveColor() } : {}}
                    disabled={isRefreshing}
                  >
                    <LayoutGrid size={16} />
                  </button>
                </Tooltip>
                <Tooltip text="Kanban Board">
                  <button
                    onClick={() => handleViewChange('kanban')}
                    className={`p-1.5 rounded-md transition-all ${
                      currentView === 'kanban' 
                        ? `${getViewButtonActiveBg()} shadow-sm` 
                        : getViewButtonInactiveColor()
                    }`}
                    style={currentView === 'kanban' ? { color: getViewButtonActiveColor() } : {}}
                    disabled={isRefreshing}
                  >
                    <Kanban size={16} />
                  </button>
                </Tooltip>
              </div>

              {/* Utility Actions */}
              <div className={`flex items-center p-1 rounded-lg shadow-sm border gap-0.5 ${getViewSwitcherBg()} ${getViewSwitcherBorder()}`}>
                <Tooltip text="Bulk Upload">
                  <Reusable_Button
                    variant='secondary'
                    onClick={() => handleViewChange('bulk')}
                    className={`p-1.5 rounded-md transition-all ${
                      currentView === 'bulk' 
                        ? `${getViewButtonActiveBg()} shadow-sm` 
                        : getViewButtonInactiveColor()
                    }`}
                    icon={<Upload size={16} />}
                    disabled={!Roles?.canCreate || isRefreshing}
                  />
                </Tooltip>
                <Tooltip text="Export All Records">
                  <Reusable_Button
                    variant='secondary'
                    onClick={() => setIsExportModalOpen(true)}
                    className={`p-1.5 rounded-md transition-all ${getViewButtonInactiveColor()}`}
                    icon={<ArrowUpFromLine size={16} />}
                    disabled={!Roles?.canEdit || isRefreshing}
                  />
                </Tooltip>
              </div>

              {/* Primary Action Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Reusable_Button 
                  text='Add New Lead'
                  variant="primary"
                  icon={<Plus size={16} />}
                  size='px-4 py-2 text-sm font-medium shadow-md rounded-lg'
                  onClick={() => navigate(`/${localStorage.getItem('subdomain')}/leads/create-leads/`)}
                  disabled={!Roles?.canCreate || isRefreshing}
                  className="w-full sm:w-auto"
                />
              </motion.div>
            </div>
          </motion.header>

          {/* --- LAYER 2: UNIFIED DATA VIEW --- */}
          <motion.main 
            variants={itemVariants} 
            className={`transition-all duration-300 ${
              currentView === 'kanban' 
                ? '' 
                : `${getMainBg()} rounded-xl md:rounded-2xl shadow-sm  ${getMainBorder()} overflow-hidden`
            }`}
          >
            <div className={currentView === 'table' || currentView === 'grid' ? 'p-0 sm:p-0' : ''}>
              {renderView()}
            </div>
          </motion.main>
        </div>

        {/* Export Modal Component */}
        <ExportModal 
          isOpen={isExportModalOpen} 
          onClose={() => setIsExportModalOpen(false)} 
          data={leadsData?.leads || []}
          selectedIds={selectedIds}
        />
      </motion.div>
    </>
  );
};

export default Leads;