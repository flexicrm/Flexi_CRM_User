import { AnimatePresence, motion } from 'framer-motion';
import { Building2, CalendarCog, Download, Mail, Phone, PlusCircle, RefreshCw, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Generating_new_leads from "../../assets/image/Generating_new_leads.gif";
import Reusable_Button from '../../component/button/Reusable_Button';
import RippleLoader from '../../component/Loader/RippleLoader';
import { errorAlert, successAlert, warningAlert } from '../../component/Notification/statusHandler';
import Table from '../../component/table/Table';
import TableNotFound from '../../component/TableNotFound/TableNotFound';
import { fetchCustomerTableData } from '../../store/homepage_slice/Customer_Slice';
import Customer_Stats from './Customer_Stats';

// --- Types ---
interface CustomerData {
  _id?: string;
  customerProfile?: string;
  Companyname?: string;
  customerId?: string;
  phone?: string;
  email?: string;
  status?: string;
  createdAt?: string;
}

interface TableDataItem {
  id: string;
  profile: string;
  company: string;
  customerId: string;
  phone: string;
  email: string;
  gst: string;
  status: string;
  created: string;
}

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

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Error occurred while fetching customers. Please try again.";
  
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
    errorMessage = "Network error. Please check your internet connection and try again.";
  }
  if (errorMessage.toLowerCase().includes('timeout')) {
    errorMessage = "Request timed out. Please try again.";
  }
  
  return errorMessage;
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

const Customers: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<TableDataItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasError, setHasError] = useState<string | null>(null);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);

  const { customerTableData, loading } = useSelector(
    (state: any) => state.customer
  );

  // Fetch customer data
  const fetchCustomers = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      }
      setHasError(null);
      await dispatch(fetchCustomerTableData() as any).unwrap();
      
      if (!isInitialLoad && showRefreshLoader) {
        successAlert("Customers refreshed successfully!", "Great", "Refreshed");
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      setHasError(errorMessage);
      
      if (!isInitialLoad) {
        errorAlert(errorMessage, "Retry", "Load Failed");
      }
    } finally {
      setIsRefreshing(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchCustomers(false);
  }, [dispatch]);

  // Theme-based styles
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
  const getMainBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getMainBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200/60';
  const getErrorCardBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getErrorCardBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200';
  const getErrorIconBg = () => darkMode ? 'bg-red-900/20' : 'bg-red-50';
  const getErrorIconColor = () => darkMode ? 'text-red-400' : 'text-red-500';
  const getErrorTitleColor = () => darkMode ? 'text-gray-200' : 'text-slate-800';
  const getErrorTextColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';
  
  // Floating toast styles
  const getToastBg = () => darkMode ? 'bg-gray-800' : 'bg-[#0F172A]';
  const getToastBorder = () => darkMode ? 'border-gray-700' : 'border-slate-700/50';
  const getToastIconBg = () => darkMode ? 'bg-gray-700' : 'bg-slate-800';
  const getToastIconColor = () => darkMode ? primaryColor || '#818CF8' : '#6366f1';
  const getToastTextColor = () => darkMode ? 'text-gray-200' : 'text-white';
  const getToastDivider = () => darkMode ? 'bg-gray-700' : 'bg-slate-700';
  const getToastButtonBg = () => darkMode ? 'bg-indigo-500/20' : 'bg-indigo-500/10';
  const getToastButtonHoverBg = () => darkMode ? 'bg-indigo-500' : 'bg-indigo-500';
  const getToastButtonTextColor = () => darkMode ? 'text-indigo-400' : 'text-indigo-400';
  const getToastButtonHoverTextColor = () => 'text-white';
  const getToastButtonBorder = () => darkMode ? 'border-indigo-500/30' : 'border-indigo-500/20';
  const getToastCloseColor = () => darkMode ? 'text-gray-500 hover:text-white' : 'text-slate-400 hover:text-white';

  // SAFE DATA TRANSFORMATION
  const tableData: TableDataItem[] = useMemo(() => {
    return customerTableData?.customers?.map((item: CustomerData) => ({
      id: String(item?._id || ""),
      profile: item?.customerProfile || "",
      company: String(item?.Companyname ?? "N/A"),
      customerId: String(item?.customerId ?? ""),
      phone: String(item?.phone ?? ""),
      email: String(item?.email ?? ""),
      gst: "-",
      status: String(item?.status ?? ""), 
      created: item?.createdAt || "",
    })) || [];
  }, [customerTableData]);

  // COLUMNS DEFINITION with theme support
  const columns = useMemo(() => [
    {
      title: 'Profile',
      dataIndex: 'profile',
      key: 'profile',
      width: '70px',
      filterable: false as const,
      sortable: false as const,
      render: (profile: string) => (
        <div className="flex items-center justify-center">
          <motion.img
            whileHover={{ scale: 1.05, rotate: 2 }}
            src={profile || "https://via.placeholder.com/40"}
            alt="profile"
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full ring-2 object-cover shadow-sm ${
              darkMode ? 'ring-gray-700 bg-gray-800' : 'ring-slate-100 bg-slate-50'
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
            }}
          />
        </div>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      filterable: true as const,
      sortable: true as const,
      render: (text: string) => (
        <span className={`font-semibold text-sm ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
          {text}
        </span>
      ),
    },
    {
      title: 'Customer ID',
      dataIndex: 'customerId',
      key: 'customerId',
      filterable: true as const,
      sortable: true as const,
      render: (id: string) => (
        <span className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold border ${
          darkMode 
            ? 'bg-gray-700 text-gray-300 border-gray-600' 
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {id || '-'}
        </span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'contact',
      key: 'contact',
      filterable: false as const,
      sortable: false as const,
      render: (_: any, record: TableDataItem) => (
        <div className="flex flex-col text-xs gap-1">
          <div className={`flex items-center gap-1.5 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
            <Mail size={12} />
            <span className="truncate max-w-[160px] text-xs">{record.email || '-'}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Mobile',
      dataIndex: 'contact',
      key: 'contact',
      filterable: false as const,
      sortable: false as const,
      render: (_: any, record: TableDataItem) => (
        <div className="flex flex-col text-xs gap-1">
          <div className={`flex items-center gap-1.5 font-medium ${
            darkMode ? 'text-gray-300' : 'text-slate-700'
          }`}>
            <Phone size={12} style={{ color: primaryColor || '#6366f1' }} />
            <span>{record.phone || '-'}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filterable: true as const,
      sortable: true as const,
      filterType: 'status' as const,
      filterOptions: [
        { label: 'Active', value: '1' },
        { label: 'Inactive', value: '0' },
      ],
      render: (status: string) => {
        const isActive = String(status) === '1';
        return (
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className={`text-xs font-medium ${isActive ? 'text-emerald-700' : 'text-rose-700'} ${
              darkMode ? (isActive ? 'text-emerald-400' : 'text-rose-400') : ''
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      filterable: true as const,
      sortable: true as const,
      filterType: 'date' as const,
      render: (date: string) => (
        <div className={`flex items-center gap-1.5 text-xs ${
          darkMode ? 'text-gray-400' : 'text-slate-600'
        }`}>
          <CalendarCog size={13} className={darkMode ? 'text-gray-500' : 'text-slate-400'} />
          <span>
            {date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
          </span>
        </div>
      ),
    },
  ], [darkMode, primaryColor]);

  const handleRefresh = () => {
    fetchCustomers(true);
  };

  const handleExport = () => {
    if (selectedRows.length === 0) {
      warningAlert("No customers selected. Please select customers to export.", "Select Customers");
      return;
    }
    
    console.log("Exporting selected customers:", selectedRows);
    successAlert(`Exporting ${selectedRows.length} customer(s)`, "Proceed", "Export Started");
  };

  // Show full page loader only on initial load
  if (isInitialLoad && loading) {
    return <RippleLoader />;
  }

  // Show error state with retry option
  if (hasError && !tableData.length && !isRefreshing) {
    return (
      <div className={`min-h-screen py-6 px-4 md:py-8 md:px-6 lg:px-8 ${getPageBg()}`}>
        <div className="w-full mx-auto">
          <div className={`flex flex-col items-center justify-center py-16 text-center rounded-xl border ${getErrorCardBg()} ${getErrorCardBorder()}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${getErrorIconBg()}`}>
              <Building2 size={32} className={getErrorIconColor()} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${getErrorTitleColor()}`}>Failed to Load Customers</h3>
            <p className={`text-sm mb-6 max-w-md px-4 ${getErrorTextColor()}`}>{hasError}</p>
            <div className="flex gap-3">
              <Reusable_Button
                text="Try Again"
                variant="primary"
                onClick={handleRefresh}
                icon={<RefreshCw size={14} />}
                isLoading={isRefreshing}
                size="px-4 py-2 text-sm"
              />
              <Reusable_Button
                text="Go Back"
                variant="secondary"
                onClick={() => window.history.back()}
                size="px-4 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    );
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
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm ${getHeaderIconBg()}`}>
                <Building2 size={20} strokeWidth={2.5} className="md:w-6 md:h-6" style={{ color: getHeaderIconColor() }} />
              </div>
              <div>
                <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold tracking-tight ${getTitleColor()}`}>
                  Client Directory
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className={`text-xs md:text-sm ${getSubtitleColor()}`}>
                    View and manage all registered companies and customers.
                  </p>
                  <span className={`w-1 h-1 rounded-full hidden sm:block ${getSeparatorColor()}`}></span>
                  <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider hidden sm:block ${getCountColor()}`}>
                    {tableData.length} Total
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Tooltip text="Refresh Data">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`p-2 rounded-lg shadow-sm border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getButtonBg()} ${getButtonBorder()} ${getButtonTextColor()} ${getButtonHoverBg()}`}
                >
                  <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                </button>
              </Tooltip>
            </div>
          </motion.header>

          {/* --- LAYER 2: ANALYTICS WIDGETS --- */}
          <motion.section variants={itemVariants}>
            <Customer_Stats />
          </motion.section>

          {/* --- LAYER 3: UNIFIED DATA CARD --- */}
          <motion.main variants={itemVariants} className={`rounded-xl md:rounded-2xl shadow-sm border overflow-hidden flex flex-col ${getMainBg()} ${getMainBorder()}`}>
            <div className="p-0 sm:p-0">
              {tableData.length === 0 ? (
                <TableNotFound 
                  image={Generating_new_leads}
                  title="No Customers Yet"
                  description="Start adding your first customer to manage and grow your business effectively."
                  buttonText="Create New Customer"
                  buttonIcon={<PlusCircle size={16} />}
                  onAction={() => navigate(`/${localStorage.getItem("subdomain")}/leads/create-leads`)}
                />
              ) : (
                <Table
                  columns={columns}
                  data={tableData}
                  showSelection={true}
                  onSelectionChange={setSelectedRows}
                  enableSearch={true}
                  searchPlaceholder="Search by company, email, or ID..."
                  actionButtons={{
                    showView: false,
                    showEdit: false,
                    showDelete: false,
                    showFollowUp: false,
                    showConvert: false,
                  }}
                  pagination={{
                    currentPage,
                    itemsPerPage,
                    totalItems: tableData.length,
                    onPageChange: setCurrentPage,
                    onItemsPerPageChange: (size) => {
                      setItemsPerPage(size);
                      setCurrentPage(1);
                    },
                  }}
                  theme={{ darkMode, primaryColor }}
                />
              )}
            </div>
          </motion.main>
        </div>

        {/* --- FLOATING BULK ACTIONS TOAST --- */}
        <AnimatePresence>
          {selectedRows.length > 0 && !isRefreshing && (
            <motion.div 
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
              className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-3 py-2.5 rounded-xl shadow-xl border ${getToastBg()} ${getToastBorder()}`}
            >
              <div className={`flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${getToastIconBg()}`}>
                <span style={{ color: getToastIconColor() }}>{selectedRows.length}</span>
              </div>
              <span className={`font-medium text-xs tracking-wide ${getToastTextColor()}`}>
                Customer{selectedRows.length !== 1 ? 's' : ''} Selected
              </span>
              <div className={`w-px h-5 mx-1 ${getToastDivider()}`}></div>
              
              {/* Bulk Export Button */}
              <button
                onClick={handleExport}
                className={`group text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border ${getToastButtonBg()} ${getToastButtonTextColor()} ${getToastButtonBorder()} hover:${getToastButtonHoverBg()} hover:${getToastButtonHoverTextColor()}`}
              >
                <Download size={13} className="group-hover:scale-110 transition-transform" />
                Export
              </button>

              <button
                onClick={() => setSelectedRows([])}
                className={`rounded-md p-1.5 transition-colors ${getToastCloseColor()}`}
                aria-label="Clear selection"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default Customers;