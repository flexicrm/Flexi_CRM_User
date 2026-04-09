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

// --- Tooltip Component ---
const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="group relative flex flex-col items-center">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 animate-in fade-in zoom-in-95 duration-200">
      <span className="relative z-10 px-2 py-1 text-[10px] font-semibold text-white whitespace-nowrap bg-slate-800 shadow-md rounded-md">
        {text}
      </span>
      <div className="w-2 h-2 -mt-1 rotate-45 bg-slate-800 rounded-sm"></div>
    </div>
  </div>
);

const Customers: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<TableDataItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasError, setHasError] = useState<string | null>(null);
  const navigate = useNavigate();

  const dispatch = useDispatch();

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

  // COLUMNS DEFINITION
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
            className="w-8 h-8 md:w-10 md:h-10 rounded-full ring-2 ring-slate-100 object-cover bg-slate-50 shadow-sm"
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
        <span className="font-semibold text-slate-800 text-sm">{text}</span>
      ),
    },
    {
      title: 'Customer ID',
      dataIndex: 'customerId',
      key: 'customerId',
      filterable: true as const,
      sortable: true as const,
      render: (id: string) => (
        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-mono font-bold border border-slate-200">
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

          <div className='flex items-center gap-1.5 text-slate-500'>
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
          <div className='flex items-center gap-1.5 text-slate-700 font-medium'>
            <Phone size={12} className="text-indigo-500" />
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
            <span className={`text-xs font-medium ${isActive ? 'text-emerald-700' : 'text-rose-700'}`}>
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
        <div className='flex items-center gap-1.5 text-slate-600 text-xs'>
          <CalendarCog size={13} className="text-slate-400" />
          <span>
            {date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
          </span>
        </div>
      ),
    },
  ], []);

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
      <div className="min-h-screen bg-[#F8FAFC] py-6 px-4 md:py-8 md:px-6 lg:px-8">
        <div className="w-full mx-auto">
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-slate-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Building2 size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to Load Customers</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md px-4">{hasError}</p>
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
        className="min-h-screen bg-[#F8FAFC] py-6 px-4 md:py-8 md:px-6 lg:px-8"
      >
        <div className="w-full mx-auto space-y-6">
          
          {/* --- LAYER 1: HERO HEADER --- */}
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
                <Building2 size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Client Directory</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs md:text-sm text-slate-500">View and manage all registered companies and customers.</p>
                  <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block">
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
                  className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          <motion.main variants={itemVariants} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
            <div className="p-0 sm:p-4">
              {tableData.length === 0 ? (
                <TableNotFound 
                  image={Generating_new_leads}
                  title="No Customers Yet"
                  description="Start adding your first customer to manage and grow your business effectively."
                  buttonText="Create New Customer"
                  buttonIcon={<PlusCircle size={16} />}
                  onAction={() => navigate(`/${localStorage.getItem("subdomain")}/customers/create-customers`)}
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
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#0F172A] text-white px-3 py-2.5 rounded-xl shadow-xl border border-slate-700/50"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-indigo-400 font-bold text-xs">
                {selectedRows.length}
              </div>
              <span className="font-medium text-xs tracking-wide">
                Customer{selectedRows.length !== 1 ? 's' : ''} Selected
              </span>
              <div className="w-px h-5 bg-slate-700 mx-1"></div>
              
              {/* Bulk Export Button */}
              <button
                onClick={handleExport}
                className="group text-xs font-semibold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-indigo-500/20 hover:border-indigo-500"
              >
                <Download size={13} className="group-hover:scale-110 transition-transform" />
                Export
              </button>

              <button
                onClick={() => setSelectedRows([])}
                className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800"
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