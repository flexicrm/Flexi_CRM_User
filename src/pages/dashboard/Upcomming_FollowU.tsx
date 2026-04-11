import {
  Building2,
  LayoutGrid,
  Mail,
  Phone,
  User
} from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/Store";
import { fetchDashboardData } from "../../store/homepage_slice/Dashboard_Slice";

const Upcomming_FollowU = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { upcomingFollowUps, isLoading } = useSelector(
    (state: RootState) => state.dashboard
  );
  const {  darkMode } = useSelector((state: any) => state.theme);

  // Safely extract leads array
  const upcomingFollowUpsData = upcomingFollowUps?.data?.upcomingFollowUps || [];
  const leadsArray = Array.isArray(upcomingFollowUpsData) ? upcomingFollowUpsData : [];

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Helper function to handle status colors with theme support
  const getStatusStyles = (leadstatus: any) => {
    const defaultColor = "#64748b";
    const apiColor = leadstatus?.color;
    
    const finalColor = (apiColor && apiColor.startsWith('#')) ? apiColor : defaultColor;
    
    if (darkMode) {
      return {
        backgroundColor: `${finalColor}20`, // Slightly higher opacity for dark mode
        color: finalColor,
        border: `1px solid ${finalColor}50`
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

  // Get header border color
  const getHeaderBorder = () => {
    return darkMode ? 'border-gray-700' : 'border-slate-100';
  };

  // Get header background
  const getHeaderBg = () => {
    return darkMode ? 'bg-gray-800' : 'bg-white';
  };

  // Get title color
  const getTitleColor = () => {
    return darkMode ? 'text-white' : 'text-slate-800';
  };

  // Get icon background
  const getIconBg = () => {
    return darkMode ? 'bg-gray-700' : 'bg-slate-100';
  };

  // Get icon color
  const getIconColor = () => {
    return darkMode ? 'text-gray-400' : 'text-slate-500';
  };

  // Get table header background
  const getTableHeaderBg = () => {
    return darkMode ? 'bg-gray-800' : 'bg-white';
  };

  // Get table header text color
  const getTableHeaderColor = () => {
    return darkMode ? 'text-gray-400' : 'text-slate-500';
  };

  // Get table header border
  const getTableHeaderBorder = () => {
    return darkMode ? 'border-gray-700' : 'border-slate-100';
  };

  // Get table row border
  const getTableRowBorder = () => {
    return darkMode ? 'border-gray-700' : 'border-slate-100';
  };

  // Get lead name color
  const getLeadNameColor = () => {
    return darkMode ? 'text-blue-400' : 'text-blue-600';
  };

  // Get lead sub text color
  const getLeadSubColor = () => {
    return darkMode ? 'text-gray-500' : 'text-slate-400';
  };

  // Get contact text color
  const getContactTextColor = () => {
    return darkMode ? 'text-blue-400' : 'text-blue-600';
  };

  // Get source text color
  const getSourceTextColor = () => {
    return darkMode ? 'text-gray-300' : 'text-slate-800';
  };

  // Get view all button color
  const getViewAllColor = () => {
    return darkMode ? 'text-gray-300' : 'text-slate-800';
  };

  const handleViewAll = () => {
    window.location.href = `/${localStorage.getItem("subdomain")}/leads/followup`;
  };

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
    <div className={`${getCardBg()} rounded-xl border ${getBorderColor()} shadow-sm w-full overflow-hidden transition-all duration-300`}>
      {/* Card Header */}
      <div className={`flex justify-between items-center p-5 ${getHeaderBg()} border-b ${getHeaderBorder()}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getIconBg()}`}>
            <LayoutGrid size={16} className={getIconColor()} strokeWidth={3} />
          </div>
          <h2 className={`text-lg font-bold tracking-tight ${getTitleColor()}`}>
            Upcoming Followups
          </h2>
        </div>
        <button 
          onClick={handleViewAll}
          className={`text-sm font-semibold transition-all hover:opacity-70 ${getViewAllColor()}`}
        >
          View All →
        </button>
      </div>

      {/* Table Container with Fixed Height & Scroll */}
      <div className="w-full max-h-[450px] overflow-y-auto overflow-x-hidden custom-scrollbar">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10">
            <tr className={`${getTableHeaderBg()} border-b ${getTableHeaderBorder()}`}>
              <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${getTableHeaderColor()}`}>
                Lead
              </th>
              <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${getTableHeaderColor()}`}>
                Contact
              </th>
              <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${getTableHeaderColor()}`}>
                Status
              </th>
              <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${getTableHeaderColor()}`}>
                Lead Source
              </th>
            </tr>
          </thead>
          <tbody>
            {leadsArray.map((lead: any,) => {
              const statusStyle = getStatusStyles(lead.leadstatus);
              
              return (
                <tr 
                  key={lead._id} 
                  className={`border-b ${getTableRowBorder()} transition-colors ${
                    darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Lead Column */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <User size={18} className={getIconColor()} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-semibold text-sm ${getLeadNameColor()}`}>
                          {lead.manualData?.name || "N/A"}
                        </span>
                        <div className={`flex items-center gap-1 text-xs mt-0.5 ${getLeadSubColor()}`}>
                          <Building2 size={12} />
                          <span className="truncate max-w-[150px]">
                            {lead.manualData?.jobTitle || lead.manualData?.website || lead.LeadId || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Column */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col gap-1.5">
                      <div className={`flex items-center gap-2 text-sm ${getContactTextColor()}`}>
                        <Mail size={14} className={getIconColor()} />
                        <span className="truncate max-w-[180px]">
                          {lead.manualData?.email || "N/A"}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${getContactTextColor()}`}>
                        <Phone size={14} className={getIconColor()} />
                        <span>{lead.manualData?.mobileNo || "N/A"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-6 py-4 align-middle">
                    <span 
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-all duration-200"
                      style={statusStyle}
                    >
                      {lead.leadstatus?.statusName || lead.leadstatus?.status || "New"}
                    </span>
                  </td>

                  {/* Lead Source Column */}
                  <td className="px-6 py-4 align-middle">
                    <span className={`text-sm font-medium ${getSourceTextColor()}`}>
                      {lead.leadsource || "Offline"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {leadsArray.length === 0 && (
          <div className={`py-12 text-center ${darkMode ? 'text-gray-400' : 'text-slate-400'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              darkMode ? 'bg-gray-700' : 'bg-slate-100'
            }`}>
              <LayoutGrid size={20} className={getIconColor()} />
            </div>
            <p className="text-sm font-medium">No upcoming followups found</p>
            <p className="text-xs mt-1 opacity-70">New followups will appear here</p>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#1f2937' : '#f1f5f9'};
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4b5563' : '#cbd5e1'};
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#6b7280' : '#94a3b8'};
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${darkMode ? '#4b5563 #1f2937' : '#cbd5e1 #f1f5f9'};
        }
      `}</style>
    </div>
  );
};

export default Upcomming_FollowU;