import {
  Building2,
  Mail,
  Phone,
  TrendingUp
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../component/table/Table";
import { fetchDashboardData } from "../../store/homepage_slice/Dashboard_Slice";
import type { AppDispatch, RootState } from "../../store/Store";

const High_Leads = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { highValueLeads, isLoading } = useSelector(
    (state: RootState) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Safely extract data
  const leads = highValueLeads?.data?.highValueLeads || [];

  // Transform data for table
  const tableData = useMemo(() => {
    return leads.map((lead: any, index: number) => ({
      id: lead._id || index,
      leadName: lead.leadName || "N/A",
      priority: lead.priority || "Medium",
      company: lead.leadCompany || "-",
      email: lead.leadEmail || "N/A",
      mobile: lead.leadMobile || "N/A",
      raw: lead
    }));
  }, [leads]);

  // Helper function to get priority styles
  const getPriorityStyles = (priority: string) => {
    const priorityLower = priority?.toLowerCase() || 'medium';
    
    switch (priorityLower) {
      case 'high':
        return {
          backgroundColor: '#dc262615',
          color: '#dc2626',
          border: '1px solid #dc262640'
        };
      case 'medium':
        return {
          backgroundColor: '#f59e0b15',
          color: '#f59e0b',
          border: '1px solid #f59e0b40'
        };
      case 'low':
        return {
          backgroundColor: '#10b98115',
          color: '#10b981',
          border: '1px solid #10b98140'
        };
      default:
        return {
          backgroundColor: '#64748b15',
          color: '#64748b',
          border: '1px solid #64748b40'
        };
    }
  };

  // Define columns for the Table component
  const columns = useMemo(() => [
    {
      title: 'Lead Name',
      dataIndex: 'leadName',
      key: 'leadName',
      width: '200px',
      filterable: true,
      sortable: true,
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-indigo-600" />
          </div>
          <span className="font-semibold text-slate-800 capitalize">{name}</span>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: '120px',
      filterable: true,
      sortable: true,
      filterType: 'select' as const,
      filterOptions: [
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' },
      ],
      render: (priority: string) => {
        const styles = getPriorityStyles(priority);
        return (
          <span 
            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold capitalize"
            style={styles}
          >
            {priority || 'Medium'}
          </span>
        );
      },
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      width: '180px',
      filterable: true,
      sortable: true,
      render: (company: string) => (
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-slate-400" />
          <span className="text-sm text-slate-700">{company}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '200px',
      filterable: true,
      sortable: true,
      render: (email: string) => (
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-slate-400" />
          <span className="text-sm text-indigo-600 truncate">{email}</span>
        </div>
      ),
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      width: '150px',
      filterable: true,
      sortable: true,
      render: (mobile: string) => (
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-slate-400" />
          <span className="text-sm text-slate-700 font-medium">{mobile}</span>
        </div>
      ),
    },
  ], []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Card Header */}
      <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-amber-600" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">High Value Leads</h2>
            <p className="text-xs text-slate-500 mt-0.5">Top priority prospects with high potential</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = `/${localStorage.getItem("subdomain")}/leads`}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
        >
          View All →
        </button>
      </div>

      {/* Table Component */}
      <Table
        columns={columns}
        data={tableData}
        showSelection={false}
        enableSearch={true}
        searchPlaceholder="Search high value leads by name, company, or email..."
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
        emptyMessage="No high value leads found"
        className="border-0 rounded-none"
      />
    </div>
  );
};

export default High_Leads;