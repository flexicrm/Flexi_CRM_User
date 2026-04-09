import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowDownCircle,
  ArrowLeft,
  ArrowUpCircle,
  Building2,
  Calendar,
  Circle,
  Clock,
  FileText,
  Globe,
  Landmark,
  ListTodo,
  Loader2,
  Mail,
  MessageSquare,
  MinusCircle,
  MonitorPlay,
  PencilLine,
  Phone,
  ShieldCheck,
  Target,
  User,
  Users
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Reusable_Button from "../../component/button/Reusable_Button";
import Reusable_Fields from "../../component/Fields/Reusable_Fiealds";
import { GETactivity } from "../../store/homepage_slice/Leads_slice";

import {
  addFollowUp_status,
  getViewPage
} from "../../store/homepage_slice/Leads_slice";

import AddFollowUp_Modal from "./AddFaloowUp_Model";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
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

const tabContentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.3, ease: "easeOut" as const } 
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    transition: { duration: 0.2, ease: "easeIn" as const } 
  },
};

// --- Tooltip Component ---
const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="group relative flex flex-col items-center">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 animate-in fade-in zoom-in-95 duration-200">
      <span className="relative z-10 px-2 py-1 text-[10px] font-semibold text-white whitespace-nowrap bg-slate-800 shadow-md rounded-md">
        {text}
      </span>
      <div className="w-2 h-2 -mt-1 rotate-45 bg-slate-800 rounded-sm"></div>
    </div>
  </div>
);

/* ================= COMPONENT: LEAD STATUS CARD ================= */
const LeadStatusCard = ({ lead }: any) => (
  <motion.div variants={itemVariants} className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/60 h-fit sticky top-6">
    <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
      <div className="flex items-center gap-2">
        <Target className="text-indigo-500" size={18} />
        <h3 className="text-base font-bold text-slate-800 tracking-tight">Lead Status</h3>
      </div>
      <span 
        className="px-2.5 py-1 bg-white border rounded-md text-[11px] font-bold shadow-sm"
        style={{ color: lead?.leadstatus?.color || '#0d1954', borderColor: lead?.leadstatus?.color || '#cbd5e1' }}
      >
        {lead?.leadstatus?.statusName || "N/A"}
      </span>
    </div>

    <div className="space-y-3">
      <StatusRow 
        icon={<Landmark size={14} className="text-emerald-500" />}
        label="Potential Value" 
        value={lead?.manualData?.potentialValue || lead?.potentialValue ? `₹${lead?.manualData?.potentialValue || lead?.potentialValue}` : "₹0"} 
        isValue 
      />
      <StatusRow 
        icon={<Calendar size={14} className="text-blue-500" />}
        label="Created Date" 
        value={lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"} 
      />
      <StatusRow 
        icon={<Clock size={14} className="text-orange-500" />}
        label="Last Activity" 
        value={lead?.lastActivity || "Today"} 
      />
      <StatusRow 
        icon={<ShieldCheck size={14} className="text-purple-500" />}
        label="Owner" 
        value={lead?.ownerDetails?.name || lead?.owner?.firstname || lead?.owner || "N/A"} 
        color="text-indigo-600" 
      />
    </div>
  </motion.div>
);

const StatusRow = ({ icon, label, value, isValue, color = "text-slate-600" }: any) => (
  <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
    <span className={`text-xs font-bold ${isValue ? "text-[#0d1954] text-sm" : color}`}>{value}</span>
  </div>
);

/* ================= TAB 1: OVERVIEW ================= */
const OverviewTab = ({ lead }: any) => (
  <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/60 min-h-[400px]">
    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
      <FileText className="text-indigo-500" size={18} />
      <h3 className="text-base font-bold text-slate-800 tracking-tight">Contact Information</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InfoItem icon={<User size={14} className="text-indigo-500" />} label="Full Name" value={lead?.manualData?.name || 'N/A'} />
      <InfoItem icon={<Mail size={14} className="text-indigo-500" />} label="Email" value={lead?.manualData?.email || 'N/A'} color="text-indigo-600" />
      <InfoItem icon={<Phone size={14} className="text-indigo-500" />} label="Phone" value={lead?.manualData?.mobileNo || 'N/A'} />
      <InfoItem icon={<Building2 size={14} className="text-indigo-500" />} label="Company" value={lead?.manualData?.company || 'N/A'} color="text-indigo-600" />
      <InfoItem icon={<Globe size={14} className="text-indigo-500" />} label="Website" value={lead?.manualData?.website || 'N/A'} color="text-indigo-600" />
      <InfoItem icon={<MessageSquare size={14} className="text-indigo-500" />} label="Notes" value={lead?.notes?.[0] || lead?.description || 'No notes available'} />
    </div>
  </div>
);

/* ================= TAB 2: FOLLOWUPS ================= */
const FollowupsTab = ({ followUps, onAdd, statuses }: any) => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const navigate = useNavigate();
    const location = useLocation();
  const { tableId } = location.state || {};

  const filterOptions = useMemo(() => [
    { label: "All Statuses", value: "all" },
    ...(statuses || []).map((s: any) => ({ label: s.StatusName, value: s._id }))
  ], [statuses]);

  const filteredFollowUps = useMemo(() => {
    if (!followUps) return [];
    if (selectedFilter === "all") return followUps;
    return followUps.filter((f: any) => f?.status?._id === selectedFilter || f?.status === selectedFilter);
  }, [followUps, selectedFilter]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || visibleCount >= filteredFollowUps.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 6);
      setLoadingMore(false);
    }, 800);
  }, [loadingMore, visibleCount, filteredFollowUps.length]);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) handleLoadMore();
    });
    if (node) observer.current.observe(node);
  }, [handleLoadMore, loadingMore]);

  const TypeIcon = ({ type }: { type: any }) => {
    const typeStr = typeof type === 'string' ? type : (type?.TypeName || type?.name || type?.type || '');
    const t = String(typeStr).toLowerCase();
    
    if (t.includes('call') || t.includes('phone')) return <Phone size={14} className="text-blue-500" />;
    if (t.includes('email')) return <Mail size={14} className="text-orange-500" />;
    if (t.includes('meeting')) return <Users size={14} className="text-purple-500" />;
    if (t.includes('whatsapp')) return <MessageSquare size={14} className="text-green-500" />;
    return <MonitorPlay size={14} className="text-slate-500" />;
  };

  const PriorityChip = ({ priority }: { priority: any }) => {
    const pStr = typeof priority === 'string' ? priority : (priority?.name || priority?.priority || '');
    const p = String(pStr).toLowerCase();
    
    let color = "text-green-700 bg-green-50 border-green-200";
    let Icon = ArrowDownCircle;
    
    if (p === 'high') { color = "text-red-700 bg-red-50 border-red-200"; Icon = ArrowUpCircle; }
    else if (p === 'medium') { color = "text-orange-700 bg-orange-50 border-orange-200"; Icon = MinusCircle; }
    
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${color}`}>
        <Icon size={10} /> {pStr || 'Low'}
      </span>
    );
  };

  const getPriorityBorder = (priority: any) => {
    const pStr = typeof priority === 'string' ? priority : (priority?.name || priority?.priority || '');
    const p = String(pStr).toLowerCase();
    
    if (p === 'high') return 'border-l-[3px] border-l-red-500';
    if (p === 'medium') return 'border-l-[3px] border-l-orange-500';
    return 'border-l-[3px] border-l-green-500';
  };

  return (
    <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/60 min-h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ListTodo className="text-indigo-500" size={18} />
          <h3 className="text-base font-bold text-slate-800 tracking-tight">Follow-Ups</h3>
        </div>
        <div className="w-full sm:w-56">
          <Reusable_Fields
            type="select"
            name="fStatus"
            value={selectedFilter}
            onChange={(e: any) => setSelectedFilter(e.target.value)}
            options={filterOptions}
          />
        </div>
      </div>

      {filteredFollowUps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...filteredFollowUps].reverse().slice(0, visibleCount).map((followup: any, index: number) => {
            const isLast = index + 1 === visibleCount;
            return (
              <motion.div 
                ref={isLast ? lastElementRef : null}
                key={followup._id || index}
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer ${getPriorityBorder(followup.priority)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-slate-50 rounded-md border border-slate-100">
                      <TypeIcon type={followup?.type} />
                    </div>
                    <h4 className="font-bold text-[#0d1954] text-xs">
                      {followup?.leadStatus?.StatusName || followup?.leadStatus?.statusName || 'No Title'}
                    </h4>
                    <PencilLine 
  size={14} 
  onClick={(e) => {
    e.stopPropagation();
    navigate(
      `/${localStorage.getItem('subdomain')}/leads?modal=schedule-followup&LeadId=${tableId}`,
      { 
        state: { 
          followUpData: followup, 
          followUpId: followup._id,
          tableId: tableId 
        } 
      }
    );
  }}
  className="cursor-pointer hover:text-indigo-600 transition-colors"
/>
                  </div>
                  <PriorityChip priority={followup.priority} />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="px-2 py-0.5 rounded-md text-[9px] font-bold border shadow-sm"
                    style={{ 
                      backgroundColor: `${followup?.status?.color || '#cbd5e1'}20`, 
                      color: followup?.status?.color || '#475569',
                      borderColor: followup?.status?.color || '#cbd5e1' 
                    }}
                  >
                    {followup?.status?.StatusName || 'Pending'}
                  </span>
                  <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <Calendar size={11} /> Due: {followup.dueDate ? new Date(followup.dueDate).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                
                <p className="text-xs text-slate-600 mb-2 line-clamp-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                  {followup.notes || "No notes provided"}
                </p>
                
                <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] font-semibold text-slate-400">
                  <span>Created: {followup.createdAt ? new Date(followup.createdAt).toLocaleDateString() : '—'}</span>
                  {followup.assignTo?.length > 0 && (
                     <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-600">
                       <User size={10} /> {followup.assignTo.map((u: any) => u.firstname || u.name).join(', ')}
                     </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
            <Clock className="text-slate-400" size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No follow-ups scheduled</h3>
          <p className="text-slate-500 text-xs mb-4 max-w-sm text-center">
            There are currently no tasks or events planned.
          </p>
          <Reusable_Button
            text="Schedule First Follow-Up"
            variant="primary"
            size="sm"
            onClick={onAdd}
            icon={<Calendar size={14} />}
          />
        </div>
      )}

      {loadingMore && (
        <div className="flex justify-center my-4">
          <Loader2 className="animate-spin text-indigo-500" size={20} />
        </div>
      )}
    </div>
  );
};

/* ================= TAB 3: ACTIVITY ================= */
const ActivityTab = ({ activities, isLoading }: any) => {
  const [visibleActivities, setVisibleActivities] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const sortedActivities = useMemo(() => {
    if (!activities || activities.length === 0) return [];
    return [...activities].sort((a, b) => 
      new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()
    );
  }, [activities]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || visibleActivities >= sortedActivities.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleActivities(prev => prev + 5);
      setLoadingMore(false);
    }, 600);
  }, [loadingMore, visibleActivities, sortedActivities.length]);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) handleLoadMore();
    });
    if (node) observer.current.observe(node);
  }, [handleLoadMore, loadingMore]);

  const getActivityIcon = (type: string) => {
    const icons: any = {
      'call': '📞',
      'email': '✉️',
      'meeting': '👥',
      'note': '📝',
      'task': '✅',
      'followup': '⏰',
      'default': <Circle size={12} className="text-blue-500 fill-blue-500" />
    };
    return icons[type?.toLowerCase()] || icons.default;
  };

  const getActivityColor = (type: string) => {
    const colors: any = {
      'call': 'bg-blue-100 text-blue-700 border-blue-200',
      'email': 'bg-purple-100 text-purple-700 border-purple-200',
      'meeting': 'bg-green-100 text-green-700 border-green-200',
      'note': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'task': 'bg-orange-100 text-orange-700 border-orange-200',
      'followup': 'bg-red-100 text-red-700 border-red-200',
      'default': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[type?.toLowerCase()] || colors.default;
  };

  return (
    <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/60 min-h-[400px]">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
        <Activity className="text-indigo-500" size={18} />
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">Activity Timeline</h3>
          <p className="text-slate-400 text-[10px] font-medium mt-0.5">Recent interactions with this lead</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 h-full">
          <Loader2 className="animate-spin text-indigo-500 mb-2" size={24} />
          <p className="text-slate-400 text-xs font-bold">Loading activities...</p>
        </div>
      ) : (
        <div className="relative pl-6">
          {/* Vertical timeline line */}
          <div className="absolute left-[9px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent"></div>
          
          {sortedActivities?.length > 0 ? (
            sortedActivities.slice(0, visibleActivities).map((activity: any, index: number) => {
              const isLast = index + 1 === visibleActivities;
              const activityDate = new Date(activity.timestamp || activity.createdAt);
              const isToday = activityDate.toDateString() === new Date().toDateString();
              
              let dateLabel = '';
              if (isToday) dateLabel = 'Today';
              else {
                const yesterday = new Date(Date.now() - 86400000);
                if (activityDate.toDateString() === yesterday.toDateString()) dateLabel = 'Yesterday';
                else dateLabel = activityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }
              
              return (
                <div 
                  key={activity.id || activity._id || index} 
                  ref={isLast ? lastElementRef : null}
                  className="relative mb-4 group last:mb-0"
                >
                  {/* Timeline dot with icon */}
                  <div className="absolute left-[-22px] top-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white ${getActivityColor(activity.actionType || activity.type)} transition-transform group-hover:scale-110`}>
                      {getActivityIcon(activity.actionType || activity.type)}
                    </div>
                  </div>
                  
                  {/* Content card */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3 ml-3 hover:shadow-md hover:border-indigo-200 transition-all duration-300">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-slate-800 font-bold text-xs capitalize flex items-center gap-1.5">
                          {activity.actionType || activity.type || 'Activity'}
                        </h4>
                        {activity.priority && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                            activity.priority === 'high' ? 'bg-red-100 text-red-700' :
                            activity.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {activity.priority}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                          {dateLabel}
                        </span>
                        <time className="text-[9px] font-medium text-slate-400">
                          {activityDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                    </div>
                    
                    <div className="text-slate-600 text-xs mt-1.5 font-medium leading-relaxed bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                      {activity.description || activity.message || 'No description provided'}
                    </div>
                    
                    {activity.user && (
                      <div className="mt-2 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-indigo-600">
                            {activity.user.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">by {activity.user}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                <Activity className="text-slate-300" size={24} />
              </div>
              <p className="text-slate-400 text-xs font-bold">No activity history found</p>
            </div>
          )}
        </div>
      )}

      {loadingMore && !isLoading && (
        <div className="flex justify-center mt-4">
          <Loader2 className="animate-spin text-indigo-500" size={20} />
        </div>
      )}

      {!isLoading && sortedActivities?.length > 0 && visibleActivities >= sortedActivities.length && sortedActivities.length > 5 && (
        <div className="text-center mt-6">
          <p className="text-slate-400 text-[10px] font-bold bg-slate-50 py-1.5 rounded-lg border border-slate-100 max-w-[180px] mx-auto">
            No more activities to load
          </p>
        </div>
      )}
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */
const TABS = [
  { id: "Overview", label: "Overview", icon: FileText },
  { id: "Followups", label: "Follow-Ups", icon: ListTodo },
  { id: "Activity", label: "Activity", icon: Activity },
];

const View_Leads = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  const location = useLocation();
  const { tableId, mainId } = location.state || {};

  const lead = useSelector((state: any) => state.leads.viewLead);
  const statusList = useSelector((state: any) => state.leads.followUpStatuses);
  const loading = useSelector((state: any) => state.leads.loading);

  // States for fetching activities exactly like the Next.js pattern
  const [activitiesData, setActivitiesData] = useState<any[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);

  // Fetch API for Activity - Fetches parallel to the page load
  const fetchActivities = useCallback(async () => {
    if (!mainId) return;
    setIsActivitiesLoading(true);
    try {     
      const response = await GETactivity(mainId);
      setActivitiesData(response?.data?.data?.activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsActivitiesLoading(false);
    }
  }, [mainId]);

  useEffect(() => {
    if (tableId) {
      dispatch(getViewPage(tableId) as any);
      dispatch(addFollowUp_status() as any);
      fetchActivities();
    }
  }, [tableId, dispatch, fetchActivities]);

  const handleEditLead = () => {
    if (lead) {
      navigate(`/${localStorage.getItem("subdomain")}/leads/create-leads`, {
        state: { 
          tableData: lead, 
          tableId: lead.LeadId 
        }
      });
    }
  };

  if (loading && !lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-[#0d1954] mb-3" size={36} />
        <p className="text-slate-500 font-medium tracking-wide text-sm">Loading Profile...</p>
      </div>
    );
  }

  // Get status color for display
  const statusColor = lead?.leadstatus?.color || '#0d1954';

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#F8FAFC] py-6 px-4 md:py-8 md:px-6 lg:px-8"
    >
      <div className="w-full max-w-[1400px] mx-auto space-y-6">
        
        {/* --- HERO HEADER --- */}
        <motion.header variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <Tooltip text="Go Back">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
              >
                <ArrowLeft size={18} />
              </button>
            </Tooltip>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
              <User size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#0d1954] tracking-tight mb-0.5">
                {lead?.manualData?.name || 'N/A'}
              </h1>
              <div className="flex items-center flex-wrap gap-2">
                <div className="flex items-center gap-1 text-slate-500 text-xs">
                  <Building2 size={12} className="text-slate-400" /> 
                  {lead?.manualData?.company || 'N/A'}
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span 
                    className="text-xs font-semibold"
                    style={{ color: statusColor }}
                  >
                    {lead?.leadstatus?.statusName || 'No Status'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <Tooltip text="Edit Lead Details">
              <Reusable_Button
                text="Edit Lead"
                variant="outline"
                size="sm"
                onClick={handleEditLead}
                icon={<User size={14} />}
                className="px-3 py-1.5 text-xs"
              />
            </Tooltip>
            <Tooltip text="Schedule New Follow-Up">
              <Reusable_Button
                text="Schedule Follow-Up"
                variant="primary"
                size="sm"
                onClick={() => setSearchParams({ modal: "schedule-followup" }, { state: location.state })}
                icon={<Calendar size={14} />}
                className="px-3 py-1.5 text-xs shadow-md shadow-indigo-200/50"
              />
            </Tooltip>
          </div>
        </motion.header>

        {/* --- TAB NAVIGATION --- */}
        <motion.div variants={itemVariants} className="flex overflow-x-auto custom-scrollbar hide-scrollbar gap-1.5 pb-1 pt-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                  isActive 
                    ? "text-[#0d1954] bg-white shadow-sm border border-slate-200/60" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent"
                }`}
              >
                <Icon size={14} className={isActive ? "text-indigo-500" : "text-slate-400"} />
                {tab.label}
                
                {isActive && (
                  <motion.div 
                    layoutId="activeViewTabIndicator"
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#F8FAFC]"
                    transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* --- CONTENT GRID --- */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {activeTab === "Overview" && <OverviewTab lead={lead} />}
                {activeTab === "Followups" && (
                  <FollowupsTab 
                    followUps={lead?.followUps} 
                    statuses={statusList} 
                    onAdd={() => setSearchParams({ modal: "schedule-followup" }, { state: location.state })} 
                  />
                )}
                {activeTab === "Activity" && (
                  <ActivityTab 
                    activities={activitiesData} 
                    isLoading={isActivitiesLoading} 
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4">
            <LeadStatusCard lead={lead} />
          </div>

        </motion.div>
      </div>

      <AddFollowUp_Modal 
        tableId={tableId} 
        selectedData={lead} 
      />
    </motion.div>
  );
};

/* Helper Components */
const InfoItem = ({ icon, label, value, color = "text-slate-800" }: any) => (
  <div className="flex gap-2 items-start p-2.5 rounded-lg bg-slate-50/50 border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-colors">
    <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-[#0d1954]">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">{label}</p>
      <p className={`font-semibold text-xs ${color} break-all`}>{value || "N/A"}</p>
    </div>
  </div>
);

export default View_Leads;