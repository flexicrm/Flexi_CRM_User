import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowUpFromLine,
  Kanban,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Target,
  Upload,
  X
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
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
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

// --- Tooltip Component ---
const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="group relative flex flex-col items-center">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 animate-in fade-in zoom-in-95 duration-200">
      <span className="relative z-10 px-2.5 py-1.5 text-[11px] font-semibold text-white whitespace-nowrap bg-slate-800 shadow-xl rounded-md">
        {text}
      </span>
      <div className="w-2.5 h-2.5 -mt-1.5 rotate-45 bg-slate-800 rounded-sm"></div>
    </div>
  </div>
);

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

  const renderView = () => {
    // Don't show error during initial load or refresh
    if (error && !isInitialLoad && !isRefreshing) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="text-rose-500 mb-3" size={40} />
          <h3 className="text-lg font-semibold text-slate-800">Failed to load leads</h3>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
          <button 
            onClick={handleRefresh} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
        className="min-h-screen bg-[#F8FAFC] py-8 px-6 lg:px-10"
      >
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* --- LAYER 1: HERO HEADER --- */}
          <motion.header variants={itemVariants} className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Target size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Lead Pipeline</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-slate-500">Track, convert, and manage your prospects.</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {leadsData?.leadsCount || 0} Total {leadsData?.leadsCount === 1 ? 'Record' : 'Records'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-4 xl:justify-end w-full xl:w-auto">
              
              {/* Refresh Button */}
              <Tooltip text="Refresh Data">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Loader2 size={18} className={isRefreshing ? "animate-spin" : ""} />
                </button>
              </Tooltip>

              {/* View Switchers */}
              <div className="flex items-center p-1 bg-white rounded-xl shadow-sm border border-slate-200">
                <Tooltip text="Table View">
                  <button
                    onClick={() => handleViewChange('table')}
                    className={`p-2 rounded-lg transition-all ${currentView === 'table' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                    disabled={isRefreshing}
                  >
                    <List size={18} />
                  </button>
                </Tooltip>
                <Tooltip text="Grid View">
                  <button
                    onClick={() => handleViewChange('grid')}
                    className={`p-2 rounded-lg transition-all ${currentView === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                    disabled={isRefreshing}
                  >
                    <LayoutGrid size={18} />
                  </button>
                </Tooltip>
                <Tooltip text="Kanban Board">
                  <button
                    onClick={() => handleViewChange('kanban')}
                    className={`p-2 rounded-lg transition-all ${currentView === 'kanban' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                    disabled={isRefreshing}
                  >
                    <Kanban size={18} />
                  </button>
                </Tooltip>
              </div>

              {/* Utility Actions */}
              <div className="flex items-center p-1 bg-white rounded-xl shadow-sm border border-slate-200 gap-1">
                <Tooltip text="Bulk Upload">
                  <Reusable_Button
                    variant='secondary'
                    onClick={() => handleViewChange('bulk')}
                    className={`p-2 rounded-lg transition-all ${currentView === 'bulk' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                    icon={<Upload size={18} />}
                    disabled={!Roles?.canCreate || isRefreshing}
                  />
                </Tooltip>
                <Tooltip text="Export All Records">
                  <Reusable_Button
                    variant='secondary'
                    onClick={() => setIsExportModalOpen(true)}
                    className="p-2 rounded-lg transition-all text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                    icon={<ArrowUpFromLine size={18} />}
                    disabled={!Roles?.canEdit || isRefreshing}
                  />
                </Tooltip>
              </div>

              {/* Primary Action Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Reusable_Button 
                  text='Add New Lead'
                  variant="primary"
                  icon={<Plus size={18} />}
                  size='px-5 py-2.5 font-medium shadow-lg shadow-indigo-200/50 rounded-xl'
                  onClick={() => navigate(`/${localStorage.getItem('subdomain')}/leads/create-leads/`)}
                  disabled={!Roles?.canCreate || isRefreshing}
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
                : 'bg-white rounded-3xl shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-slate-200/60 overflow-hidden'
            }`}
          >
            <div className={currentView === 'table' || currentView === 'grid' ? 'p-2 sm:p-6' : ''}>
              {renderView()}
            </div>
          </motion.main>
        </div>

        {/* --- FLOATING BULK ACTIONS TOAST --- */}
        <AnimatePresence>
          {selectedIds.length > 0 && !isRefreshing && (
            <motion.div 
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/50"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-sm">
                {selectedIds.length}
              </div>
              <span className="font-medium text-sm tracking-wide">
                Lead{selectedIds.length !== 1 ? 's' : ''} Selected
              </span>
              <div className="w-px h-6 bg-slate-700 mx-2"></div>
              
              {/* Export Selected Data Button */}
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="group text-sm font-semibold bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-xl transition-all flex items-center gap-2 border border-white/5 hover:border-white/20"
              >
                <ArrowUpFromLine size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                Export Selected
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
                aria-label="Clear selection"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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