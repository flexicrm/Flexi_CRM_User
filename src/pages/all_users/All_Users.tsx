import { AnimatePresence, motion } from 'framer-motion';
import { Filter, Loader2, Trash2, Users, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Reusable_Button from '../../component/button/Reusable_Button';
import Table from '../../component/table/Table';
import AllUser_Stats from './AllUser_Stats';

import {
  confirmAlert,
  errorAlert,
  successAlert
} from '../../component/Notification/statusHandler';

import {
  Delete_User,
  fetchAllUsersTableData
} from '../../store/homepage_slice/AllUsers_Slice';

// Helper function to extract error message
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Failed to delete user. Please try again.";
  if (error?.response?.data) {
    const responseData = error.response.data;
    if (responseData.errors) {
      if (typeof responseData.errors === 'string') errorMessage = responseData.errors;
      else if (typeof responseData.errors === 'object') {
        const firstErrorKey = Object.keys(responseData.errors)[0];
        errorMessage = firstErrorKey && responseData.errors[firstErrorKey] 
          ? responseData.errors[firstErrorKey] 
          : JSON.stringify(responseData.errors);
      }
    } else if (responseData.message) errorMessage = responseData.message;
    else if (responseData.error) errorMessage = responseData.error;
  } else if (error?.errors) {
    if (typeof error.errors === 'string') errorMessage = error.errors;
    else if (typeof error.errors === 'object') {
      const firstErrorKey = Object.keys(error.errors)[0];
      errorMessage = firstErrorKey && error.errors[firstErrorKey] 
        ? error.errors[firstErrorKey] 
        : JSON.stringify(error.errors);
    }
  } else if (error?.message) errorMessage = error.message;

  return errorMessage;
};

// --- Types ---
interface User {
  _id?: string;
  Profile?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  mobile?: string;
  userRole?: string;
  status?: string | number;
  createdAt?: string;
}

interface TableDataItem {
  id: string;
  profile: string;
  firstname: string;
  lastname: string;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  created: string;
  raw: User;
}

interface RootState {
  allUsers: {
    AllUsersTableData: { data?: { users?: User[] } };
    loading: boolean;
  };
}

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  admins: number;
  managers: number;
  regularUsers: number;
}

// --- Animation Variants (FIXED) ---
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

const All_Users: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [selectedRows, setSelectedRows] = useState<TableDataItem[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { AllUsersTableData, loading } = useSelector((state: RootState) => state.allUsers);
        const { permissions} = useSelector((state: any) => state.auth);
      const Roles = permissions[2]

  const refreshData = () => {
    dispatch(fetchAllUsersTableData() as any);
  };

  useEffect(() => {
    refreshData();
  }, [dispatch]);

  const tableData: TableDataItem[] = useMemo(() => {
    const users = AllUsersTableData?.data?.users || [];
    return users.map((item: User) => ({
      id: String(item?._id || ""),
      profile: item?.Profile || "",
      firstname: item?.firstname || "",
      lastname: item?.lastname || "",
      fullName: `${item?.firstname || ''} ${item?.lastname || ''}`.trim(),
      email: item?.email || "N/A",
      mobile: item?.mobile || "N/A",
      role: item?.userRole || "N/A",
      status: String(item?.status ?? "0"),
      created: item?.createdAt || "",
      raw: item 
    }));
  }, [AllUsersTableData]);

  const stats: StatsData = useMemo(() => {
    const users = tableData;
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === '1').length,
      inactiveUsers: users.filter(u => u.status === '0').length,
      admins: users.filter(u => u.role === 'Admin').length,
      managers: users.filter(u => u.role === 'Manager').length,
      regularUsers: users.filter(u => u.role === 'User' || u.role === 'N/A').length
    };
  }, [tableData]);

  const filteredData = useMemo(() => {
    let filtered = [...tableData];
    if (statusFilter) filtered = filtered.filter(user => user.status === statusFilter);
    if (roleFilter) filtered = filtered.filter(user => user.role === roleFilter);
    return filtered;
  }, [tableData, statusFilter, roleFilter]);

  const handleStatsFilter = (filterType: string, value: string | null) => {
    if (filterType === 'status') {
      setStatusFilter(value);
      setCurrentPage(1);
    } else if (filterType === 'role') {
      setRoleFilter(value);
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    setStatusFilter(null);
    setRoleFilter(null);
    setCurrentPage(1);
  };

  const handleDelete = (record: TableDataItem) => {
    confirmAlert({
      title: "Delete User",
      message: `Are you sure you want to delete ${record.fullName}? This action cannot be undone.`,
      confirmText: "Delete User",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          const response: any = await Delete_User(record.id as any, {});
          successAlert(response?.message || response?.data?.message || "User deleted successfully!", "Done");
          refreshData();
        } catch (error: any) {
          errorAlert(extractErrorMessage(error), "Retry");
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    confirmAlert({
      title: "Bulk Delete Users",
      message: `Are you sure you want to delete ${selectedRows.length} selected user(s)?`,
      confirmText: `Delete ${selectedRows.length} Users`,
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          let successCount = 0;
          let failedCount = 0;
          
          for (const user of selectedRows) {
            try {
              await Delete_User(user.id as any, {});
              successCount++;
            } catch (error) {
              failedCount++;
            }
          }
          
          if (successCount > 0 && failedCount === 0) successAlert(`Deleted ${successCount} user(s)!`, "Done");
          else if (successCount > 0 && failedCount > 0) successAlert(`Deleted ${successCount} user(s), ${failedCount} failed.`, "Done");
          else if (failedCount > 0) errorAlert(`Failed to delete ${failedCount} user(s).`, "Retry");
          
          setSelectedRows([]);
          refreshData();
        } catch (error: any) {
          errorAlert(extractErrorMessage(error), "Retry");
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const handleEdit = (record: TableDataItem) => {
    navigate(`/${localStorage.getItem("subdomain")}/user/alluser-create`, {
      state: { edit: true, editData: record.raw, userId: record?.raw?._id },
    });
  };

  // FIXED: Columns with proper filterType types
  const columns = useMemo(() => [
    {
      title: 'Profile',
      dataIndex: 'profile',
      key: 'profile',
      width: '70px',
      filterable: false,
      sortable: false,
      render: (profile: string) => (
        <div className="flex items-center justify-center">
          <motion.img
            whileHover={{ scale: 1.1, rotate: 3 }}
            src={profile || "https://via.placeholder.com/40"}
            alt="profile"
            className="w-10 h-10 rounded-full ring-2 ring-slate-100 object-cover bg-slate-50"
          />
        </div>
      ),
    },
    {
      title: 'User Details',
      dataIndex: 'fullName',
      key: 'fullName',
      filterable: true,
      sortable: true,
      render: (name: string, record: TableDataItem) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{name || 'N/A'}</span>
          <span className="text-xs text-slate-500 mt-0.5">{record.email}</span>
        </div>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'mobile',
      key: 'mobile',
      filterable: true,
      sortable: true,
      render: (mobile: string) => <span className="text-slate-600">{mobile}</span>
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filterable: true,
      sortable: true,
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Admin', value: 'Admin' },
        { label: 'Manager', value: 'Manager' },
        { label: 'User', value: 'User' },
      ],
      render: (role: string) => {
        const roleColors: Record<string, string> = {
          Admin: "bg-purple-50 text-purple-700 border-purple-200",
          Manager: "bg-blue-50 text-blue-700 border-blue-200",
          User: "bg-slate-50 text-slate-700 border-slate-200"
        };
        const colorClass = roleColors[role] || roleColors.User;
        return (
          <span className={`px-2.5 py-1 rounded-md text-[12px] font-medium border ${colorClass}`}>
            {role}
          </span>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filterable: true,
      sortable: true,
      filterType: 'status' as const,
      render: (status: string) => {
        const isActive = String(status) === '1';
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className={`text-[13px] font-medium ${isActive ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Joined Date',
      dataIndex: 'created',
      key: 'created',
      filterable: true,
      sortable: true,
      filterType: 'date' as const,
      render: (date: string) =>
        date ? <span className="text-slate-600">{new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span> : '-',
    },
  ], []);

  if (loading && !tableData.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={42} />
        <p className="text-slate-500 font-medium tracking-wide">Syncing Workspace...</p>
      </div>
    );
  }

  const StatsComponent = AllUser_Stats as any;
  const hasActiveFilters = statusFilter || roleFilter;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#F8FAFC] py-8 px-6 lg:px-10"
    >
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* --- LAYER 1: HERO HEADER --- */}
        <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Users size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Team Directory</h1>
              <p className="text-sm text-slate-500 mt-1">Manage user access, roles, and status across your workspace.</p>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Reusable_Button
              onClick={() => navigate(`/${localStorage.getItem("subdomain")}/user/alluser-create`)}
              variant='primary'
              text='+ Add New User'
              size='px-5 py-2.5 font-medium shadow-lg shadow-indigo-200/50 rounded-xl'
              disabled = {permissions?.canCreate} 
            />
          </motion.div>
        </motion.header>

        {/* --- LAYER 2: ANALYTICS WIDGETS --- */}
        <motion.section variants={itemVariants}>
          <StatsComponent
            stats={stats}
            onFilterClick={handleStatsFilter}
            activeStatusFilter={statusFilter}
            activeRoleFilter={roleFilter}
          />
        </motion.section>

        {/* --- LAYER 3: UNIFIED DATA CARD --- */}
        <motion.main variants={itemVariants} className="bg-white rounded-3xl shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-slate-200/60 overflow-hidden flex flex-col">
          
          {/* Context Toolbar inside the Card */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-slate-50/80 border-b border-slate-100 px-6 py-4"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-slate-400 mr-2">
                    <Filter size={16} />
                    <span className="text-sm font-semibold text-slate-600">Filtered By:</span>
                  </div>
                  
                  {statusFilter && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 shadow-sm">
                      <span className="text-indigo-600">Status:</span> {statusFilter === '1' ? 'Active' : 'Inactive'}
                      <button onClick={() => setStatusFilter(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                        <X size={14} />
                      </button>
                    </span>
                  )}

                  {roleFilter && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 shadow-sm">
                      <span className="text-indigo-600">Role:</span> {roleFilter}
                      <button onClick={() => setRoleFilter(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                        <X size={14} />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={clearFilters}
                    className="ml-auto text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-200/50"
                  >
                    Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table Container */}
          <div className="p-2 sm:p-6">
            <Table
              columns={columns}
              data={filteredData}
              showSelection={true}
              onSelectionChange={setSelectedRows}
              enableSearch={true}
              searchPlaceholder="Search by name, email, or role..."
              actionButtons={{
                showView: false,
                showEdit: Roles?.canEdit,
                showDelete: Roles?.canDelete,
                showFollowUp: false,
                showConvert: false,
                 onEdit: (record: TableDataItem) => {
    if (!Roles?.canEdit) return;  
    handleEdit(record);
  },

  onDelete: (record: TableDataItem) => {
    if (!Roles?.canDelete) return; 
    handleDelete(record);
  },


              }}
              pagination={{
                currentPage,
                itemsPerPage,
                totalItems: filteredData.length,
                onPageChange: setCurrentPage,
                onItemsPerPageChange: (size: number) => {
                  setItemsPerPage(size);
                  setCurrentPage(1);
                },
              }}
            />
          </div>
        </motion.main>
      </div>

      {/* --- FLOATING BULK ACTIONS TOAST --- */}
      <AnimatePresence>
        {selectedRows.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/50"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-indigo-400 font-bold text-sm">
              {selectedRows.length}
            </div>
            <span className="font-medium text-sm tracking-wide">
              Users Selected
            </span>
            <div className="w-px h-6 bg-slate-700 mx-2"></div>
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="group text-sm font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 border border-rose-500/20 hover:border-rose-500"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} className="group-hover:scale-110 transition-transform" />}
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedRows([])}
              className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
              aria-label="Clear selection"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default All_Users;