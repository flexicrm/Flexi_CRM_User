import { CalendarCog, Loader2, Mail, Phone } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Table from '../../component/table/Table';
import { fetchCustomerTableData } from '../../store/homepage_slice/Customer_Slice';
import Customer_Stats from './Customer_Stats';

const Customers: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const dispatch = useDispatch();

  const { customerTableData, loading } = useSelector(
    (state: any) => state.customer
  );

  useEffect(() => {
    dispatch(fetchCustomerTableData());
  }, [dispatch]);

  //  SAFE DATA TRANSFORMATION
  // Use useMemo to prevent re-calculating on every render
  const tableData = useMemo(() => {
    return customerTableData?.customers?.map((item: any) => ({
      id: String(item?._id || ""),
      profile: item?.customerProfile || "",
      company: String(item?.Companyname ?? "N/A"),
      customerId: String(item?.customerId ?? ""),
      phone: String(item?.phone ?? ""),
      email: String(item?.email ?? ""),
      gst: "-",
      status: String(item?.status ?? ""), // Convert to string for filter matching
      created: item?.createdAt || "",
    })) || [];
  }, [customerTableData]);

  //  COLUMNS DEFINITION
  const columns: any = useMemo(() => [
    {
      title: 'Profile',
      dataIndex: 'profile',
      key: 'profile',
      width: '80px',
      render: (profile: string) => (
        <img
          src={profile || "https://via.placeholder.com/40"}
          alt="profile"
          className="w-10 h-10 rounded-full border shadow-sm object-cover"
        />
      ),
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      render: (text: string) => <span className="font-semibold text-slate-700">{text}</span>,
    },
    {
      title: 'Customer ID',
      dataIndex: 'customerId',
      key: 'customerId',
      render: (id: string) => (
        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-mono font-bold">
          {id || '-'}
        </span>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_: any, record: any) => (
        <div className="flex flex-col text-xs gap-1">
          <div className='flex items-center gap-2 text-slate-600'>
            <Phone size={12} className="text-indigo-500" />
            <span>{record.phone || '-'}</span>
          </div>
          <div className='flex items-center gap-2 text-slate-400'>
            <Mail size={12} />
            <span className="truncate max-w-[150px]">{record.email || '-'}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      //  Status Filter Configuration
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
        <div className='flex items-center gap-2 text-slate-500 text-xs'>
          <CalendarCog size={14} className="text-slate-400" />
          <span>
            {date ? new Date(date).toLocaleDateString() : '-'}
          </span>
        </div>
      ),
    },
  ], []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Loading Customers</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen">
      <div className="mb-8">
        <Customer_Stats />
      </div>

      <div className="max-w-full mx-auto">
        <Table
          columns={columns}
          data={tableData}
          showSelection
          onSelectionChange={setSelectedRows}
          enableSearch
          searchPlaceholder="Search customers..."
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
        />
      </div>

      {/*  Selection UI Overlay */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex gap-6 items-center z-[100] border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Selected</span>
            <span className="text-sm font-bold leading-none">{selectedRows.length} Customers</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-700" />
          <div className="flex gap-2">
             <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
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

export default Customers;