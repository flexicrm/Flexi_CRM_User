import {
  Building2,
  LayoutGrid,
  Mail,
  Phone,
  User
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../component/table/Table";
import type { AppDispatch, RootState } from "../../store/Store";
import { fetchDashboardData } from "../../store/homepage_slice/Dashboard_Slice";

const Recent_Leads = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [activeStatusType, setActiveStatusType] = useState<'active' | 'inactive' | null>(null);
  const { recentLeads, isLoading } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);

  // Safely extract leads array
  const recentLeadsData = recentLeads?.data?.recentLeads || [];
  const leadsArray = Array.isArray(recentLeadsData) ? recentLeadsData : [];

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Transform data for table
  const tableData = useMemo(() => {
    return leadsArray.map((lead: any) => ({
      id: lead._id,
      leadName: lead.manualData?.name || "N/A",
      leadSubInfo: lead.manualData?.jobTitle || lead.manualData?.website || lead.LeadId || "N/A",
      email: lead.manualData?.email || "N/A",
      mobile: lead.manualData?.mobileNo || "N/A",
      status: lead.leadstatus?.statusName || lead.leadstatus?.status || "New",
      statusColor: lead.leadstatus?.color || "#64748b",
      leadSource: lead.leadsource || "Offline",
      raw: lead
    }));
  }, [leadsArray]);

  // Helper function to get status styles with theme support
  const getStatusStyles = (color: string) => {
    const finalColor = (color && color.startsWith('#')) ? color : "#64748b";
    
    if (darkMode) {
      return {
        backgroundColor: `${finalColor}20`,
        color: finalColor,
        border: `1px solid ${finalColor}40`
      };
    }
    
    return {
      backgroundColor: `${finalColor}15`,
      color: finalColor,
      border: `1px solid ${finalColor}40`
    };
  };

  // Get card background based on dark mode
  const getCardBg = () => {
    return darkMode ? 'bg-gray-800' : 'bg-white';
  };

  // Get border color based on dark mode
  const getBorderColor = () => {
    return darkMode ? 'border-gray-700' : 'border-slate-200';
  };

  // Get header background
  const getHeaderBg = () => {
    if (darkMode) {
      return 'bg-gradient-to-r from-gray-800 to-gray-800/50';
    }
    return 'bg-gradient-to-r from-white to-slate-50/30';
  };

  // Get header border
  const getHeaderBorder = () => {
    return darkMode ? 'border-gray-700' : 'border-slate-100';
  };

  // Get title color
  const getTitleColor = () => {
    return darkMode ? 'text-white' : 'text-slate-800';
  };

  // Get subtitle color
  const getSubtitleColor = () => {
    return darkMode ? 'text-gray-400' : 'text-slate-500';
  };

  // Get icon background
  const getIconBg = () => {
    return darkMode ? 'bg-gray-700' : 'bg-indigo-50';
  };

  // Get icon color
  const getIconColor = () => {
    return darkMode ? primaryColor || '#818CF8' : '#6366f1';
  };


  // Define columns for the Table component with theme support
  const columns = useMemo(() => [
    {
      title: 'Lead',
      dataIndex: 'leadName',
      key: 'lead',
      width: '250px',
      filterable: true,
      sortable: true,
      render: (name: string) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-gray-700' : 'bg-slate-100'
          }`}>
            <User size={16} className={darkMode ? 'text-gray-400' : 'text-slate-500'} />
          </div>
          <div className="flex flex-col">
            <span className={`font-semibold text-sm ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
              {name}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'Company',
      width: '250px',
      filterable: true,
      sortable: true,
      render: (_: string, record: any) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm">
            <Building2 size={14} className={darkMode ? 'text-gray-500' : 'text-slate-400'} />
            <span className={darkMode ? 'text-gray-300' : 'text-indigo-600'}>
              {record.leadSubInfo}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'contact',
      width: '250px',
      filterable: true,
      sortable: true,
      render: (_: string, record: any) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm">
            <Mail size={14} className={darkMode ? 'text-gray-500' : 'text-slate-400'} />
            <span style={{ color: primaryColor || '#6366f1' }}>
              {record.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'contact',
      width: '250px',
      filterable: true,
      sortable: true,
      render: (_: string, record: any) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm">
            <Phone size={14} className={darkMode ? 'text-gray-500' : 'text-slate-400'} />
            <span className={darkMode ? 'text-gray-300' : 'text-slate-600'}>
              {record.mobile}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '120px',
      filterable: true,
      sortable: true,
      filterType: 'status' as const,
      filterOptions: [
        { label: 'New', value: 'New' },
        { label: 'Contacted', value: 'Contacted' },
        { label: 'Qualified', value: 'Qualified' },
        { label: 'Proposal', value: 'Proposal' },
        { label: 'Negotiation', value: 'Negotiation' },
        { label: 'Won', value: 'Won' },
        { label: 'Lost', value: 'Lost' },
      ],
      render: (status: string, record: any) => {
        const styles = getStatusStyles(record.statusColor);
        return (
          <span 
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold"
            style={styles}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: 'Lead Source',
      dataIndex: 'leadSource',
      key: 'leadSource',
      width: '150px',
      filterable: true,
      sortable: true,
      render: (source: string) => (
        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
          {source}
        </span>
      ),
    },
  ], [darkMode, primaryColor]);

  // Prepare status options for the Table component
  const statusOptions = useMemo(() => {
    // Get unique statuses from the data
    const uniqueStatuses = Array.from(new Set(tableData.map(item => item.status)));
    return uniqueStatuses.map(status => ({
      label: status,
      value: status,
      type: 'active' as const // You can adjust this logic based on your business rules
    }));
  }, [tableData]);

  const handleStatusFilter = (status: string | null, type?: 'active' | 'inactive') => {
    setActiveStatus(status);
    setActiveStatusType(type || null);
  };

  // Loading skeleton with dark mode support
  if (isLoading) {
    return (
      <div className={`${getCardBg()} rounded-xl border ${getBorderColor()} p-8`}>
        <div className="flex items-center justify-center">
          <div className="animate-pulse flex space-x-4 w-full">
            <div className="flex-1 space-y-4 py-1">
              <div className={`h-4 rounded w-3/4 ${darkMode ? 'bg-gray-700' : 'bg-slate-200'}`}></div>
              <div className="space-y-2">
                <div className={`h-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-slate-200'}`}></div>
                <div className={`h-4 rounded w-5/6 ${darkMode ? 'bg-gray-700' : 'bg-slate-200'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getCardBg()} rounded-xl border ${getBorderColor()} overflow-hidden shadow-sm`}>
      {/* Card Header */}
      <div className={`flex justify-between items-center p-5 border-b ${getHeaderBorder()} ${getHeaderBg()}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconBg()}`}>
            <LayoutGrid size={16} style={{ color: getIconColor() }} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`text-lg font-bold tracking-tight ${getTitleColor()}`}>Recent Leads</h2>
            <p className={`text-xs ${getSubtitleColor()} mt-0.5`}>Latest prospects in your pipeline</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = `/${localStorage.getItem("subdomain")}/leads`}
          className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-all hover:bg-opacity-10"
          style={{ 
            color: primaryColor || '#6366f1',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = darkMode ? '#374151' : `${primaryColor}10`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
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
        searchPlaceholder="Search leads by name, email, or source..."
        statusOptions={statusOptions}
        onStatusFilter={handleStatusFilter}
        activeStatus={activeStatus}
        activeStatusType={activeStatusType}
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
        emptyMessage="No recent leads found"
        className="border-0 rounded-none"
        theme={{
          darkMode,
          primaryColor
        }}
      />
    </div>
  );
};

export default Recent_Leads;