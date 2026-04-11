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
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);

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

  // Helper function to get priority styles with theme support
  const getPriorityStyles = (priority: string) => {
    const priorityLower = priority?.toLowerCase() || 'medium';
    
    if (darkMode) {
      switch (priorityLower) {
        case 'high':
          return {
            backgroundColor: '#dc262620',
            color: '#f87171',
            border: '1px solid #dc262640'
          };
        case 'medium':
          return {
            backgroundColor: '#f59e0b20',
            color: '#fbbf24',
            border: '1px solid #f59e0b40'
          };
        case 'low':
          return {
            backgroundColor: '#10b98120',
            color: '#34d399',
            border: '1px solid #10b98140'
          };
        default:
          return {
            backgroundColor: '#64748b20',
            color: '#94a3b8',
            border: '1px solid #64748b40'
          };
      }
    }
    
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
    return darkMode ? 'bg-gray-700' : 'bg-amber-50';
  };

  // Get icon color
  const getIconColor = () => {
    return darkMode ? '#fbbf24' : '#d97706';
  };


  // Define columns for the Table component with theme support
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
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ 
              backgroundColor: darkMode ? '#374151' : '#EEF2FF',
              color: primaryColor || '#6366f1'
            }}
          >
            <TrendingUp size={16} />
          </div>
          <span className={`font-semibold capitalize ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
            {name}
          </span>
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
          <Building2 size={14} className={darkMode ? 'text-gray-500' : 'text-slate-400'} />
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
            {company}
          </span>
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
          <Mail size={14} className={darkMode ? 'text-gray-500' : 'text-slate-400'} />
          <span 
            className="text-sm truncate"
            style={{ color: primaryColor || '#6366f1' }}
          >
            {email}
          </span>
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
          <Phone size={14} className={darkMode ? 'text-gray-500' : 'text-slate-400'} />
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
            {mobile}
          </span>
        </div>
      ),
    },
  ], [darkMode, primaryColor]);

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
            <TrendingUp size={16} style={{ color: getIconColor() }} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`text-lg font-bold tracking-tight ${getTitleColor()}`}>High Value Leads</h2>
            <p className={`text-xs ${getSubtitleColor()} mt-0.5`}>Top priority prospects with high potential</p>
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
        theme={{
          darkMode,
          primaryColor
        }}
      />
    </div>
  );
};

export default High_Leads;