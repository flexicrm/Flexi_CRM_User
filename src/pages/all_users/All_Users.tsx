import { Loader2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Reusable_Button from '../../component/button/Reusable_Button';
import Table from '../../component/table/Table';
import AllUser_Stats from './AllUser_Stats';

// Import custom notification handlers
import {
  confirmAlert,
  errorAlert,
  successAlert
} from '../../component/Notification/statusHandler';

import {
  Delete_User,
  fetchAllUsersTableData
} from '../../store/homepage_slice/AllUsers_Slice';

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Failed to delete user. Please try again.";

  if (error?.response?.data) {
    const responseData = error.response.data;
    if (responseData.errors) {
      if (typeof responseData.errors === 'string') {
        errorMessage = responseData.errors;
      } else if (typeof responseData.errors === 'object') {
        const firstErrorKey = Object.keys(responseData.errors)[0];
        if (firstErrorKey && responseData.errors[firstErrorKey]) {
          errorMessage = responseData.errors[firstErrorKey];
        } else {
          errorMessage = JSON.stringify(responseData.errors);
        }
      }
    } else if (responseData.message) {
      errorMessage = responseData.message;
    } else if (responseData.error) {
      errorMessage = responseData.error;
    }
  } else if (error?.errors) {
    if (typeof error.errors === 'string') {
      errorMessage = error.errors;
    } else if (typeof error.errors === 'object') {
      const firstErrorKey = Object.keys(error.errors)[0];
      if (firstErrorKey && error.errors[firstErrorKey]) {
        errorMessage = error.errors[firstErrorKey];
      } else {
        errorMessage = JSON.stringify(error.errors);
      }
    }
  } else if (error?.message) {
    errorMessage = error.message;
  }

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
    AllUsersTableData: {
      data?: {
        users?: User[];
      };
    };
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

const All_Users: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [selectedRows, setSelectedRows] = useState<TableDataItem[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { AllUsersTableData, loading } = useSelector(
    (state: RootState) => state.allUsers
  );

  // FETCH USERS
  const refreshData = () => {
    dispatch(fetchAllUsersTableData() as any);
  };

  useEffect(() => {
    refreshData();
  }, [dispatch]);

  // DATA MAP
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

  // Calculate stats based on filtered data
  const stats: StatsData = useMemo(() => {
    const users = tableData;
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === '1').length;
    const inactiveUsers = users.filter(u => u.status === '0').length;
    const admins = users.filter(u => u.role === 'Admin').length;
    const managers = users.filter(u => u.role === 'Manager').length;
    const regularUsers = users.filter(u => u.role === 'User' || u.role === 'N/A').length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      admins,
      managers,
      regularUsers
    };
  }, [tableData]);

  // Filter data based on status and role
  const filteredData = useMemo(() => {
    let filtered = [...tableData];
    if (statusFilter) {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    return filtered;
  }, [tableData, statusFilter, roleFilter]);

  // Handle stats filter click
  const handleStatsFilter = (filterType: string, value: string | null) => {
    if (filterType === 'status') {
      setStatusFilter(value);
      setCurrentPage(1);
    } else if (filterType === 'role') {
      setRoleFilter(value);
      setCurrentPage(1);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter(null);
    setRoleFilter(null);
    setCurrentPage(1);
  };

  // SINGLE DELETE HANDLER
  const handleDelete = (record: TableDataItem) => {
    confirmAlert({
      title: "Delete User",
      message: `Are you sure you want to delete ${record.fullName}? This action cannot be undone.`,
      confirmText: "Delete User",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          const userId = record.id;
          
          // Fixed TS issue by casting as any
          const response: any = await Delete_User(userId as any, {});
          const successMsg = response?.message || response?.data?.message || "User deleted successfully!";
          successAlert(successMsg, "Done");
          
          refreshData();
        } catch (error: any) {
          console.error(error);
          const errorMessage = extractErrorMessage(error);
          errorAlert(errorMessage, "Retry");
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  // BULK DELETE HANDLER
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;

    confirmAlert({
      title: "Bulk Delete Users",
      message: `Are you sure you want to delete ${selectedRows.length} selected user(s)? This action cannot be undone.`,
      confirmText: `Yes, Delete ${selectedRows.length} User${selectedRows.length > 1 ? 's' : ''}`,
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          let successCount = 0;
          let failedCount = 0;
          
          for (const user of selectedRows) {
            try {
              // Fixed TS issue by casting as any
              await Delete_User(user.id as any, {});
              successCount++;
            } catch (error) {
              failedCount++;
              console.error(`Failed to delete ${user.fullName}:`, error);
            }
          }
          
          if (successCount > 0 && failedCount === 0) {
            successAlert(`Successfully deleted ${successCount} user(s)!`, "Done");
          } else if (successCount > 0 && failedCount > 0) {
            successAlert(`Deleted ${successCount} user(s) successfully, but ${failedCount} failed.`, "Done");
          } else if (failedCount > 0) {
            errorAlert(`Failed to delete ${failedCount} user(s). Please try again.`, "Retry");
          }
          
          setSelectedRows([]);
          refreshData();
        } catch (error: any) {
          const errorMessage = extractErrorMessage(error);
          errorAlert(errorMessage, "Retry");
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  // EDIT HANDLER
  const handleEdit = (record: TableDataItem) => {
    navigate(
      `/${localStorage.getItem("subdomain")}/all-users/alluser-create`,
      {
        state: {
          edit: true,
          editData: record.raw,
          userId: record?.raw?._id
        },
      }
    );
  };

  // COLUMNS with filterable and sortable properties
  const columns = useMemo(() => [
    {
      title: 'Profile',
      dataIndex: 'profile',
      key: 'profile',
      width: '70px',
      filterable: false,
      sortable: false,
      render: (profile: string) => (
        <img
          src={profile || "https://via.placeholder.com/40"}
          alt="profile"
          className="w-9 h-9 rounded-full border shadow-sm object-cover"
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      filterable: true,
      sortable: true,
      render: (name: string) => (
        <span className="font-medium text-slate-900">{name || 'N/A'}</span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      filterable: true,
      sortable: true,
    },
    {
      title: 'Contact',
      dataIndex: 'mobile',
      key: 'mobile',
      filterable: true,
      sortable: true,
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
},
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filterable: true,
      sortable: true,
      filterType: 'status',
      render: (status: string) => {
        const isActive = String(status) === '1';
        return (
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      filterable: true,
      sortable: true,
      filterType: 'date',
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : '-',
    },
  ], []);

  // LOADING STATE
  if (loading && !tableData.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  // Cast component to ANY to bypass strict typing if AllUser_Stats file isn't updated to take props yet
  const StatsComponent = AllUser_Stats as any;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <StatsComponent
          stats={stats}
          onFilterClick={handleStatsFilter}
          activeStatusFilter={statusFilter}
          activeRoleFilter={roleFilter}
        />
      </div>

      {/* Filter Bar - Show active filters */}
      {(statusFilter || roleFilter) && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          {statusFilter && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className="text-sm text-indigo-700">
                Status: {statusFilter === '1' ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => setStatusFilter(null)}
                className="text-indigo-400 hover:text-indigo-600"
              >
                ×
              </button>
            </div>
          )}
          {roleFilter && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-200">
              <span className="text-sm text-indigo-700">Role: {roleFilter}</span>
              <button
                onClick={() => setRoleFilter(null)}
                className="text-indigo-400 hover:text-indigo-600"
              >
                ×
              </button>
            </div>
          )}
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* ADD BUTTON */}
      <div className="mb-6 flex justify-end">
        <Reusable_Button
          onClick={() =>
            navigate(`/${localStorage.getItem("subdomain")}/all-users/alluser-create`)
          }
          variant='primary'
          text='Add New User'
          size='px-3 py-2.5'
        />
      </div>

      {/* TABLE */}
      <Table
        columns={columns}
        data={filteredData}
        showSelection={true}
        onSelectionChange={setSelectedRows}
        enableSearch={true}
        searchPlaceholder="Search Users..."
        actionButtons={{
          showView: false,
          showEdit: true,
          showDelete: true,
          showFollowUp: false,
          showConvert: false,
          onEdit: (record: TableDataItem) => handleEdit(record),
          onDelete: (record: TableDataItem) => handleDelete(record),
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
  );
};

export default All_Users;