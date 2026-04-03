import { AnimatePresence, motion } from 'framer-motion';
import { Building2, CalendarCog, Download, Loader2, Mail, Phone, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../component/table/Table';
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

const Customers: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<TableDataItem[]>([]);

  const dispatch = useDispatch();

  const { customerTableData, loading } = useSelector(
    (state: any) => state.customer
  );

  useEffect(() => {
    dispatch(fetchCustomerTableData() as any);
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

  // COLUMNS DEFINITION (FIXED: Added dataIndex for Contact column)
  const columns = useMemo(() => [
    {
      title: 'Profile',
      dataIndex: 'profile',
      key: 'profile',
      width: '80px',
      filterable: false as const,
      sortable: false as const,
      render: (profile: string) => (
        <div className="flex items-center justify-center">
          <motion.img
            whileHover={{ scale: 1.1, rotate: 3 }}
            src={profile || "https://via.placeholder.com/40"}
            alt="profile"
            className="w-10 h-10 rounded-full ring-2 ring-slate-100 object-cover bg-slate-50 shadow-sm"
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
        <span className="font-semibold text-slate-800">{text}</span>
      ),
    },
    {
      title: 'Customer ID',
      dataIndex: 'customerId',
      key: 'customerId',
      filterable: true as const,
      sortable: true as const,
      render: (id: string) => (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px] font-mono font-bold border border-slate-200">
          {id || '-'}
        </span>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'contact', // Added dataIndex - this is required by the Table component
      key: 'contact',
      filterable: false as const,
      sortable: false as const,
      render: (_: any, record: TableDataItem) => (
        <div className="flex flex-col text-[13px] gap-1.5">
          <div className='flex items-center gap-2 text-slate-700 font-medium'>
            <Phone size={13} className="text-indigo-500" />
            <span>{record.phone || '-'}</span>
          </div>
          <div className='flex items-center gap-2 text-slate-500'>
            <Mail size={13} />
            <span className="truncate max-w-[180px]">{record.email || '-'}</span>
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
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      filterable: true as const,
      sortable: true as const,
      filterType: 'date' as const,
      render: (date: string) => (
        <div className='flex items-center gap-2 text-slate-600 text-[13px]'>
          <CalendarCog size={15} className="text-slate-400" />
          <span>
            {date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
          </span>
        </div>
      ),
    },
  ], []);

  // LOADING STATE
  if (loading && !tableData.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={42} />
        <p className="text-slate-500 font-medium tracking-wide">Loading Client Records...</p>
      </div>
    );
  }

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
              <Building2 size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Client Directory</h1>
              <p className="text-sm text-slate-500 mt-1">View and manage all registered companies and customers.</p>
            </div>
          </div>
        </motion.header>

        {/* --- LAYER 2: ANALYTICS WIDGETS --- */}
        <motion.section variants={itemVariants}>
          <Customer_Stats />
        </motion.section>

        {/* --- LAYER 3: UNIFIED DATA CARD --- */}
        <motion.main variants={itemVariants} className="bg-white rounded-3xl shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-slate-200/60 overflow-hidden flex flex-col">
          <div className="p-2 sm:p-6">
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
            transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/50"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-indigo-400 font-bold text-sm">
              {selectedRows.length}
            </div>
            <span className="font-medium text-sm tracking-wide">
              Clients Selected
            </span>
            <div className="w-px h-6 bg-slate-700 mx-2"></div>
            
            {/* Placeholder Bulk Action Button (e.g., Export) */}
            <button
              onClick={() => console.log("Export functionality placeholder")}
              className="group text-sm font-semibold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 border border-indigo-500/20 hover:border-indigo-500"
            >
              <Download size={16} className="group-hover:scale-110 transition-transform" />
              Export
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

export default Customers;