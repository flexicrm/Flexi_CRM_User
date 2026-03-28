import { Edit3, Loader2, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Reusable_Button from '../../component/button/Reusable_Button';
import Table, { type Column } from '../../component/table/Table';
import { fetchAllUsersTableData } from '../../store/homepage_slice/AllUsers_Slice';
import AllUser_Stats from './AllUser_Stats';

const All_Users: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const dispatch = useDispatch();

  const { AllUsersTableData, loading } = useSelector(
    (state: any) => state.allUsers
  );

  useEffect(() => {
    dispatch(fetchAllUsersTableData());
  }, [dispatch]);

  // ✅ DATA TRANSFORMATION (Mapping based on your API structure)
  const tableData = useMemo(() => {
    // Note: AllUsersTableData?.data?.users matches your provided JSON structure
    return AllUsersTableData?.data?.users?.map((item: any) => ({
      id: String(item?._id || ""),
      profile: item?.Profile || "", // Note the capital 'P' from your JSON
      firstname: item?.firstname || "",
      lastname: item?.lastname || "",
      fullName: `${item?.firstname || ''} ${item?.lastname || ''}`.trim(),
      email: item?.email || "N/A",
      mobile: item?.mobile || "N/A",
      role: item?.userRole || "N/A", // API uses 'userRole'
      status: String(item?.status ?? "0"),
      created: item?.createdAt || "",
    })) || [];
  }, [AllUsersTableData]);

  // ✅ COLUMNS DEFINITION (Matching the image provided)
  const columns: Column[] = useMemo(() => [
    {
      title: 'Profile',
      dataIndex: 'profile',
      key: 'profile',
      width: '70px',
      render: (profile: string) => (
        <img
          src={profile || "https://via.placeholder.com/40"}
          alt="profile"
          className="w-9 h-9 rounded-full border border-slate-100 shadow-sm object-cover"
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string) => (
        <span className="font-medium text-slate-700">{name || 'N/A'}</span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <span className="text-slate-600 font-medium">{email}</span>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (mobile: string) => (
        <span className="text-slate-600 font-medium">{mobile}</span>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <span className="text-slate-600 font-medium">{role}</span>
      ),
    },
     {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      // ✅ Status Filter Configuration
      filterable: true,
      filterOptions: [
        { label: 'Active', value: '1' },
        { label: 'Inactive', value: '0' },
      ],
      render: (status: any) => {
        const isActive = String(status) === '1';
        return (
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            isActive 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
              : 'bg-rose-50 text-rose-600 border-rose-100'
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
      render: (date: string) => (
        <span className="text-slate-600 font-medium">
          {date ? new Date(date).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-3">
          <button className="text-slate-400 hover:text-indigo-600 transition-colors">
            <Edit3 size={18} />
          </button>
          <button className="text-slate-400 hover:text-rose-500 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ], []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen">
      <div className="mb-8">
        <AllUser_Stats />
      </div>

      <div>
        <Reusable_Button variant='primary' text='Add NewUser' size='px-4 py-2'/>
      </div>

      <div className="max-w-full mx-auto">
        <Table
          columns={columns}
          data={tableData}
          showSelection
          onSelectionChange={setSelectedRows}
          enableSearch
          searchPlaceholder="Search Users..."
          actionButtons={false} // Handled via custom 'Actions' column above to match image
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
      </div>

      {/* Selection Overlay */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex gap-6 items-center z-[100] border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Selected</span>
            <span className="text-sm font-bold leading-none">{selectedRows.length} Users</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-700" />
          <div className="flex gap-2">
             <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-black transition-all shadow-lg shadow-indigo-500/20">
               Bulk Action
             </button>
             <button 
              onClick={() => setSelectedRows([])}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-black transition-all"
             >
               Cancel
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default All_Users;