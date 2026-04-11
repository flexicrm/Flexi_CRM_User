import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CalendarClock, Check, CheckCircle2, Clock, Trash2, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Generating_new_leads from "../../assets/image/Generating_new_leads.gif";
import Reusable_Button from '../../component/button/Reusable_Button';
import RippleLoader from '../../component/Loader/RippleLoader';
import { errorAlert, successAlert } from '../../component/Notification/statusHandler';
import Table from '../../component/table/Table';
import TableNotFound from '../../component/TableNotFound/TableNotFound';

// Assuming you have this API imported from your Login_Slice or Notification_Slice
import { notificationAPI } from '../../store/Login_Slice';

// --- Types based on your provided JSON ---
interface NotificationUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
}

interface NotificationEntity {
  _id: string;
  LeadId?: string;
  [key: string]: any;
}

interface NotificationData {
  _id: string;
  actionType: string;
  description: string;
  entityId: string | NotificationEntity;
  entityType: string;
  notificationRead: boolean;
  timestamp: string;
  userId: NotificationUser;
}

interface TableDataItem {
  id: string;
  description: string;
  actionType: string;
  entityType: string;
  readStatus: boolean;
  timestamp: string;
  user: string;
  // --- ADDED THESE FOR NAVIGATION ---
  mainId?: string;
  LeadId?: string;
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

// Helper function to extract error message
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Error occurred while fetching notifications. Please try again.";
  if (error?.response?.data) {
    errorMessage = error.response.data.message || error.response.data.error || errorMessage;
  } else if (error?.message) {
    errorMessage = error.message;
  }
  return errorMessage;
};

const Notification_View: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<TableDataItem[]>([]);
  
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Fetch Notifications
  const fetchNotifications = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setIsRefreshing(true);
      if (!showRefreshLoader && notifications.length === 0) setLoading(true);
      setHasError(null);
      
      const response = await notificationAPI();
      
      const data = response?.data?.data || response?.data || {};
      const activities = data.activities || [];
      const count = data.count || activities.length;

      setNotifications(activities);
      setTotalCount(count);

      if (showRefreshLoader) {
        successAlert("Notifications refreshed successfully!", "Done");
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      setHasError(errorMessage);
      if (showRefreshLoader) {
        errorAlert(errorMessage, "Retry", "Load Failed");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // --- SAFE DATA TRANSFORMATION FIXED FOR NAVIGATION ---
  const tableData: TableDataItem[] = useMemo(() => {
    return notifications.map((item) => {
      // Safely extract the target IDs based on entityType structure
      let entityMainId = undefined;
      let entityLeadId = undefined;

      if (item.entityId && typeof item.entityId === 'object') {
        entityMainId = item.entityId._id;
        entityLeadId = item.entityId.LeadId;
      } else if (typeof item.entityId === 'string') {
        entityMainId = item.entityId;
      }

      return {
        id: item._id, // This is the Notification's ID
        description: item.description || "No description provided",
        actionType: item.actionType || "Unknown",
        entityType: item.entityType || "System",
        readStatus: item.notificationRead || false,
        timestamp: item.timestamp || "",
        user: item.userId ? `${item.userId.firstname} ${item.userId.lastname}` : "System",
        // Pass the extracted target entity IDs to the row data
        mainId: entityMainId, 
        LeadId: entityLeadId 
      };
    });
  }, [notifications]);

  // COLUMNS DEFINITION
  const columns = useMemo(() => [
    {
      title: 'Notification',
      dataIndex: 'description',
      key: 'description',
      width: '35%',
      filterable: true as const,
      sortable: true as const,
      render: (text: string, record: TableDataItem) => (
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${record.readStatus ? 'bg-transparent' : 'bg-blue-500'}`} />
          <span className={`text-sm ${record.readStatus ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'}`}>
            {text}
          </span>
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'actionType',
      key: 'actionType',
      filterable: true as const,
      sortable: true as const,
      render: (type: string) => {
        let bgColor = "bg-slate-100 text-slate-700 border-slate-200";
        if (type.toLowerCase() === 'create') bgColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (type.toLowerCase() === 'update') bgColor = "bg-blue-50 text-blue-700 border-blue-200";
        if (type.toLowerCase() === 'delete') bgColor = "bg-rose-50 text-rose-700 border-rose-200";

        return (
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${bgColor}`}>
            {type}
          </span>
        );
      },
    },
    {
      title: 'Module',
      dataIndex: 'entityType',
      key: 'entityType',
      filterable: true as const,
      sortable: true as const,
      render: (module: string) => (
        <span className="font-semibold text-slate-600 text-xs bg-slate-100 px-2 py-1 rounded-md">
          {module}
        </span>
      ),
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      filterable: true as const,
      sortable: true as const,
      render: (user: string) => (
        <span className="text-xs font-medium text-slate-700">{user}</span>
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      filterable: true as const,
      sortable: true as const,
      filterType: 'date' as const,
      render: (dateStr: string) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        
        const formattedDate = date.toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });
        const formattedTime = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        return (
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-1.5 text-slate-800 font-semibold text-xs'>
              <CalendarClock size={13} className="text-indigo-500" />
              <span>{formattedDate}</span>
            </div>
            <div className='flex items-center gap-1.5 text-slate-500 text-[11px] font-medium ml-4'>
              <Clock size={11} />
              <span>{formattedTime}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'readStatus',
      key: 'readStatus',
      filterable: true as const,
      sortable: true as const,
      filterType: 'status' as const,
      filterOptions: [
        { label: 'Read', value: 'true' },
        { label: 'Unread', value: 'false' },
      ],
      render: (isRead: boolean) => (
        <div className="flex items-center gap-1.5">
          {isRead ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              <Check size={12} /> Read
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> New
            </span>
          )}
        </div>
      ),
    },
  ], []);

  const handleRefresh = () => {
    fetchNotifications(true);
  };

  const handleMarkAsRead = () => {
    if (selectedRows.length === 0) return;
    console.log("Marking as read:", selectedRows);
    successAlert(`Marked ${selectedRows.length} notification(s) as read`, "Done");
    setSelectedRows([]);
  };

  // Initial Loader
  if (loading) {
    return <RippleLoader />;
  }

  // Error State
  if (hasError && !tableData.length && !isRefreshing) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-6 px-4 md:py-8 md:px-6 lg:px-8">
        <div className="w-full mx-auto">
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-slate-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Bell size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to Load Notifications</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md px-4">{hasError}</p>
            <div className="flex gap-3">
              <Reusable_Button
                text="Try Again"
                variant="primary"
                onClick={handleRefresh}
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
      {isRefreshing && <RippleLoader />}
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-[#F8FAFC] py-6 px-4 md:py-8 md:px-6 lg:px-8"
      >
        <div className="w-full mx-auto space-y-6">
          
          {/* --- HEADER --- */}
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
                <Bell size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs md:text-sm text-slate-500">Track all system activities and lead updates.</p>
                  <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
                  <p className="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-wider hidden sm:block">
                    {totalCount} Total
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Reusable_Button
                text="Refresh Data"
                variant="outline"
                onClick={handleRefresh}
                isLoading={isRefreshing}
                size="px-4 py-2 text-sm"
              />
            </div>
          </motion.header>

          {/* --- TABLE --- */}
          <motion.main variants={itemVariants} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
            <div className="p-0 sm:p-0">
              {tableData.length === 0 ? (
                <TableNotFound 
                  image={Generating_new_leads}
                  title="No Notifications Yet"
                  description="You are all caught up! System activities will appear here."
                  buttonText="Go to Dashboard"
                  buttonIcon={<CheckCircle2 size={16} />}
                  onAction={() => navigate(`/${localStorage.getItem("subdomain")}/dashboard`)}
                />
              ) : (
                <Table
                  columns={columns}
                  data={tableData}
                  showSelection={true}
                  onSelectionChange={setSelectedRows}
                  enableSearch={true}
                  searchPlaceholder="Search by description, action type, or module..."
                  actionButtons={false} 
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
                  // --- CORRECTED ROW CLICK NAVIGATION ---
                  onRowClick={(record: TableDataItem) => {
                    // Check if it's a Lead module and we successfully extracted the IDs
                    if (record.entityType?.toLowerCase() === 'lead' && record.mainId) {
                      navigate(`/${localStorage.getItem("subdomain")}/leads/view-leads`, { 
                        state: { 
                          tableId: record.LeadId, 
                          mainId: record.mainId 
                        } 
                      });
                    }
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
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-blue-400 font-bold text-xs">
                {selectedRows.length}
              </div>
              <span className="font-medium text-xs tracking-wide">
                Selected
              </span>
              <div className="w-px h-5 bg-slate-700 mx-1"></div>
              
              <button
                onClick={handleMarkAsRead}
                className="group text-xs font-semibold bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-blue-500/20 hover:border-blue-500"
              >
                <CheckCircle2 size={13} className="group-hover:scale-110 transition-transform" />
                Mark as Read
              </button>

              <button
                className="group text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-rose-500/20 hover:border-rose-500"
              >
                <Trash2 size={13} className="group-hover:scale-110 transition-transform" />
                Delete
              </button>

              <button
                onClick={() => setSelectedRows([])}
                className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800 ml-1"
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

export default Notification_View;