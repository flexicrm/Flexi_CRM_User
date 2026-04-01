import { CalendarCog, Loader2, Mail, Phone } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Table from '../../component/table/Table';
import { fetchCustomerTableData } from '../../store/homepage_slice/Customer_Slice';
import Customer_Stats from './Customer_Stats';

const Customers: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [, setSelectedRows] = useState<any[]>([]);

  const dispatch = useDispatch();

  const { customerTableData, loading } = useSelector(
    (state: any) => state.customer
  );

  useEffect(() => {
    dispatch(fetchCustomerTableData() as any);
  }, [dispatch]);

  // SAFE DATA TRANSFORMATION
  const tableData = useMemo(() => {
    return customerTableData?.customers?.map((item: any) => ({
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
      filterable: true,
      filterOptions: [
        { label: 'Active', value: '1' },
        { label: 'Inactive', value: '0' },
      ],
      render: (status: any) => {
        const isActive = String(status) === '1';
        return (
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
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
          showSelection={true}
          onSelectionChange={setSelectedRows}
          enableSearch={true}
          searchPlaceholder="Search customers..."
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
      </div>
    </div>
  );
};

export default Customers;