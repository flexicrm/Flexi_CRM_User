import { Loader2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Reusable_Button from '../../component/button/Reusable_Button';
import Table from '../../component/table/Table';
import AllUser_Stats from './AllUser_Stats';

import {
  Delete_User,
  fetchAllUsersTableData
} from '../../store/homepage_slice/AllUsers_Slice';

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

const All_Users: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [selectedRows, setSelectedRows] = useState<TableDataItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { AllUsersTableData, loading } = useSelector(
    (state: RootState) => state.allUsers
  );

  // FETCH USERS
  useEffect(() => {
    dispatch(fetchAllUsersTableData() as any);
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

  // DELETE HANDLER
  const handleDelete = async (record: TableDataItem) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${record.fullName}?`
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(record.id);
      await Delete_User(record.id, {});
      alert("User deleted successfully");
      dispatch(fetchAllUsersTableData() as any);
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
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

  // COLUMNS (Manual 'Actions' column removed)
  const columns = useMemo(() => [
    {
      title: 'Profile',
      dataIndex: 'profile',
      key: 'profile',
      width: '70px',
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
      render: (name: string) => (
        <span className="font-medium text-slate-900">{name || 'N/A'}</span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Contact',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const isActive = String(status) === '1';
        return (
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
            isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : '-',
    },
  ], []);

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <AllUser_Stats />
      </div>

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
        data={tableData}
        showSelection
        onSelectionChange={setSelectedRows}
        enableSearch
        searchPlaceholder="Search Users..."
        // Pass deletingId to Table so the internal menu can show the loader
        deletingId={deletingId} 
        actionButtons={{
          showView: false,
          showEdit: true,
          showDelete: true,
          // Since it's a lead table model, you can set these to false if not needed for Users
          showFollowUp: false,
          showConvert: false,
          onEdit: (record: TableDataItem) => handleEdit(record),
          onDelete: (record: TableDataItem) => handleDelete(record),
        }}
        pagination={{
          currentPage,
          itemsPerPage,
          totalItems: tableData.length,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: (size: number) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          },
        }}
      />

      {/* BULK SELECTION UI */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white px-6 py-4 rounded-2xl flex items-center gap-6 shadow-2xl z-[100] border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-[12px] font-bold">
                {selectedRows.length}
            </span>
            <span className="text-sm font-semibold">Users Selected</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-700" />
          <button 
            onClick={() => setSelectedRows([])}
            className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default All_Users;