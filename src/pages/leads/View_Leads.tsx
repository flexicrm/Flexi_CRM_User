import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowDownCircle,
  ArrowLeft,
  ArrowUpCircle,
  Building2,
  Calendar,
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

import {
  addFollowUp_status,
  getViewPage
} from "../../store/homepage_slice/Leads_slice";

import AddFollowUp_Modal from "./AddFaloowUp_Model";

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

/* ================= COMPONENT: LEAD STATUS CARD (RIGHT SIDE) ================= */
const LeadStatusCard = ({ lead }: any) => (
  <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-slate-200/60 h-fit sticky top-6">
    <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
      <div className="flex items-center gap-2">
        <Target className="text-indigo-500" size={20} />
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Lead Status</h3>
      </div>
      <span 
        className="px-3 py-1 bg-white border rounded-lg text-xs font-bold shadow-sm"
        style={{ color: lead?.leadstatus?.color || '#0d1954', borderColor: lead?.leadstatus?.color || '#cbd5e1' }}
      >
        {lead?.leadstatus?.statusName || "N/A"}
      </span>
    </div>

    <div className="space-y-5">
      <StatusRow 
        icon={<Landmark size={16} className="text-emerald-500" />}
        label="Potential Value" 
        value={lead?.manualData?.potentialValue || lead?.potentialValue ? `₹${lead?.manualData?.potentialValue || lead?.potentialValue}` : "₹0"} 
        isValue 
      />
      <StatusRow 
        icon={<Calendar size={16} className="text-blue-500" />}
        label="Created Date" 
        value={lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"} 
      />
      <StatusRow 
        icon={<Clock size={16} className="text-orange-500" />}
        label="Last Activity" 
        value={lead?.lastActivity || "Today"} 
      />
      <StatusRow 
        icon={<ShieldCheck size={16} className="text-purple-500" />}
        label="Owner" 
        value={lead?.ownerDetails?.name || lead?.owner?.firstname || lead?.owner || "N/A"} 
        color="text-indigo-600" 
      />
    </div>
  </motion.div>
);

const StatusRow = ({ icon, label, value, isValue, color = "text-slate-600" }: any) => (
  <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-medium text-slate-500">{label}</span>
    </div>
    <span className={`text-sm font-bold ${isValue ? "text-[#0d1954] text-base" : color}`}>{value}</span>
  </div>
);

/* ================= TAB 1: OVERVIEW ================= */
const OverviewTab = ({ lead }: any) => (
  <div className="bg-white rounded-3xl p-6 lg:p-10 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-slate-200/60 min-h-[500px]">
    <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-8">
      <FileText className="text-indigo-500" size={22} />
      <h3 className="text-xl font-bold text-slate-800 tracking-tight">Contact Information</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
      <InfoItem icon={<User size={18} className="text-indigo-500" />} label="Full Name" value={lead?.manualData?.name || 'N/A'} />
      <InfoItem icon={<Mail size={18} className="text-indigo-500" />} label="Email" value={lead?.manualData?.email || 'N/A'} color="text-indigo-600" />
      <InfoItem icon={<Phone size={18} className="text-indigo-500" />} label="Phone" value={lead?.manualData?.mobileNo || 'N/A'} />
      <InfoItem icon={<Building2 size={18} className="text-indigo-500" />} label="Company" value={lead?.manualData?.company || 'N/A'} color="text-indigo-600" />
      <InfoItem icon={<Globe size={18} className="text-indigo-500" />} label="Website" value={lead?.manualData?.website || 'N/A'} color="text-indigo-600" />
      <InfoItem icon={<MessageSquare size={18} className="text-indigo-500" />} label="Notes" value={lead?.notes?.[0] || lead?.description || 'No notes available'} />
    </div>
  </div>
);

/* ================= TAB 2: FOLLOWUPS ================= */
const FollowupsTab = ({ followUps, onAdd, statuses }: any) => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const observer = useRef<IntersectionObserver | null>(null);

  const filterOptions = useMemo(() => [
    { label: "All Statuses", value: "all" },
    ...(statuses || []).map((s: any) => ({ label: s.StatusName, value: s._id }))
  ], [statuses]);

  // Filtering Logic
  const filteredFollowUps = useMemo(() => {
    if (!followUps) return [];
    if (selectedFilter === "all") return followUps;
    return followUps.filter((f: any) => f?.status?._id === selectedFilter || f?.status === selectedFilter);
  }, [followUps, selectedFilter]);

  // Infinite Scroll Logic
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

  // Helper mapping components - SAFEGUARDED AGAINST OBJECTS
  const TypeIcon = ({ type }: { type: any }) => {
    const typeStr = typeof type === 'string' ? type : (type?.TypeName || type?.name || type?.type || '');
    const t = String(typeStr).toLowerCase();
    
    if (t.includes('call') || t.includes('phone')) return <Phone size={16} className="text-blue-500" />;
    if (t.includes('email')) return <Mail size={16} className="text-orange-500" />;
    if (t.includes('meeting')) return <Users size={16} className="text-purple-500" />;
    if (t.includes('whatsapp')) return <MessageSquare size={16} className="text-green-500" />;
    return <MonitorPlay size={16} className="text-slate-500" />;
  };

  const PriorityChip = ({ priority }: { priority: any }) => {
    const pStr = typeof priority === 'string' ? priority : (priority?.name || priority?.priority || '');
    const p = String(pStr).toLowerCase();
    
    let color = "text-green-700 bg-green-50 border-green-200";
    let Icon = ArrowDownCircle;
    
    if (p === 'high') { color = "text-red-700 bg-red-50 border-red-200"; Icon = ArrowUpCircle; }
    else if (p === 'medium') { color = "text-orange-700 bg-orange-50 border-orange-200"; Icon = MinusCircle; }
    
    return (
      <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${color}`}>
        <Icon size={12} /> {pStr || 'Low'}
      </span>
    );
  };

  const getPriorityBorder = (priority: any) => {
    const pStr = typeof priority === 'string' ? priority : (priority?.name || priority?.priority || '');
    const p = String(pStr).toLowerCase();
    
    if (p === 'high') return 'border-l-[4px] border-l-red-500';
    if (p === 'medium') return 'border-l-[4px] border-l-orange-500';
    return 'border-l-[4px] border-l-green-500';
  };

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-10 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-slate-200/60 min-h-[500px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <ListTodo className="text-indigo-500" size={22} />
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Follow-Ups</h3>
        </div>
        <div className="w-full sm:w-64">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...filteredFollowUps].reverse().slice(0, visibleCount).map((followup: any, index: number) => {
            const isLast = index + 1 === visibleCount;
            return (
              <motion.div 
                ref={isLast ? lastElementRef : null}
                key={followup._id || index}
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${getPriorityBorder(followup.priority)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                      <TypeIcon type={followup?.type} />
                    </div>
                    <h4 className="font-bold text-[#0d1954] text-sm">
                      {followup?.leadStatus?.StatusName || followup?.leadStatus?.statusName || 'No Title'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityChip priority={followup.priority} />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span 
                    className="px-2.5 py-0.5 rounded-md text-[10px] font-bold border shadow-sm"
                    style={{ 
                      backgroundColor: `${followup?.status?.color || '#cbd5e1'}20`, 
                      color: followup?.status?.color || '#475569',
                      borderColor: followup?.status?.color || '#cbd5e1' 
                    }}
                  >
                    {followup?.status?.StatusName || 'Pending'}
                  </span>
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Calendar size={13} /> Due: {followup.dueDate ? new Date(followup.dueDate).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                  {followup.notes || "No notes provided"}
                </p>
                
                <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] font-semibold text-slate-400">
                  <span>Created: {followup.createdAt ? new Date(followup.createdAt).toLocaleDateString() : '—'}</span>
                  {followup.assignTo?.length > 0 && (
                     <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md text-slate-600">
                       <User size={12} /> {followup.assignTo.map((u: any) => u.firstname || u.name).join(', ')}
                     </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No follow-ups scheduled</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm text-center">
            There are currently no tasks or events planned.
          </p>
          <Reusable_Button
            text="Schedule First Follow-Up"
            variant="primary"
            size="md"
            onClick={onAdd}
            icon={<Calendar size={16} />}
          />
        </div>
      )}

      {loadingMore && (
        <div className="flex justify-center my-6">
          <Loader2 className="animate-spin text-indigo-500" size={24} />
        </div>
      )}
    </div>
  );
};

/* ================= TAB 3: ACTIVITY ================= */
const ActivityTab = ({ activities }: any) => {
  const [visibleActivities, setVisibleActivities] = useState(4);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const sortedActivities = useMemo(() => {
    if (!activities) return [];
    return [...activities].sort((a, b) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime());
  }, [activities]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || visibleActivities >= sortedActivities.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleActivities(prev => prev + 4);
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

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-10 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-slate-200/60 min-h-[500px]">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-8">
        <Activity className="text-indigo-500" size={22} />
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Activity Timeline</h3>
          <p className="text-slate-400 text-[13px] font-medium mt-0.5">Recent interactions with this lead</p>
        </div>
      </div>

      <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {sortedActivities?.length > 0 ? (
          sortedActivities.slice(0, visibleActivities).map((activity: any, index: number) => {
            const isLast = index + 1 === visibleActivities;
            return (
              <div 
                key={index} 
                ref={isLast ? lastElementRef : null}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8"
              >
                  <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 border-white ${index === 0 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-slate-300'} z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2`}></div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-3rem)] bg-white border border-slate-200 p-5 rounded-2xl ml-12 md:ml-0 hover:shadow-lg hover:shadow-slate-100 hover:border-indigo-100 transition-all">
                      <div className="flex justify-between items-center mb-2">
                          <h4 className="text-[#0d1954] font-black text-sm capitalize flex items-center gap-2">
                            {activity.actionType || activity.type || 'Activity'}
                          </h4>
                          <time className="font-bold text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                            {activity.timestamp || activity.createdAt ? new Date(activity.timestamp || activity.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date N/A'}
                          </time>
                      </div>
                      <div className="text-slate-600 text-[13px] mt-2 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                        {activity.description || activity.message || 'No description provided'}
                      </div>
                  </div>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <Activity className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-400 text-sm font-bold">No activity history found</p>
          </div>
        )}
      </div>

      {loadingMore && (
        <div className="flex justify-center mt-6">
          <Loader2 className="animate-spin text-indigo-500" size={24} />
        </div>
      )}

      {sortedActivities?.length > 0 && visibleActivities >= sortedActivities.length && (
        <div className="text-center mt-10">
            <p className="text-slate-400 text-xs font-bold bg-slate-50 py-2 rounded-xl border border-slate-100 max-w-[200px] mx-auto">No more activities to load</p>
        </div>
      )}
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */
// Tab Configuration Array for mapping
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
  const { tableId } = location.state || {};
  console.log("View_Leads rendered with tableId:", tableId); // Debug log exactly as originally requested

  const lead = useSelector((state: any) => state.leads.viewLead);
  const statusList = useSelector((state: any) => state.leads.followUpStatuses);
  const loading = useSelector((state: any) => state.leads.loading);

  useEffect(() => {
    if (tableId) {
      dispatch(getViewPage(tableId) as any);
      dispatch(addFollowUp_status() as any);
    }
  }, [tableId, dispatch]);

  // Handle edit lead - EXACT matching data logic
  const handleEditLead = () => {
    if (lead) {
      navigate(`/${localStorage.getItem("subdomain")}/leads/create-leads`, {
        state: { 
          tableData: lead,  // Send complete lead data as tableData
          tableId: lead.LeadId  // Send lead ID
        }
      });
    }
  };

  if (loading && !lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-[#0d1954] mb-4" size={42} />
        <p className="text-slate-500 font-medium tracking-wide">Loading Profile...</p>
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
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* --- LAYER 1: HERO HEADER --- */}
        <motion.header variants={itemVariants} className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
              <User size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#0d1954] tracking-tight mb-1">
                {lead?.manualData?.name || 'N/A'}
              </h1>
              <div className="flex items-center flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium text-sm">
                  <Building2 size={16} className="text-slate-400" /> 
                  {lead?.manualData?.company || 'N/A'}
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
                <span
                  style={{ backgroundColor: `${lead?.leadstatus?.color || '#3b82f6'}15`, color: lead?.leadstatus?.color || '#3b82f6', borderColor: `${lead?.leadstatus?.color || '#3b82f6'}40` }}
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-bold border shadow-sm"
                >
                  {lead?.leadstatus?.statusName || "New"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <Reusable_Button
              text="Edit Lead"
              variant="outline"
              size="md"
              onClick={handleEditLead}
              icon={<User size={16} />}
              fullWidth={false}
            />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {/* EXACT LOGIC MAINTAINED WITH EXACT PROPS */}
              <Reusable_Button
                text="Schedule Follow-Up"
                variant="primary"
                size="md"
                onClick={() => setSearchParams({ modal: "schedule-followup" }, { state: location.state })}
                icon={<Calendar size={16} />}
                fullWidth={false}
              />
            </motion.div>
          </div>
        </motion.header>

        {/* --- LAYER 2: UNIFIED TAB NAVIGATION --- */}
        <motion.div variants={itemVariants} className="flex overflow-x-auto custom-scrollbar hide-scrollbar gap-2 pb-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  isActive 
                    ? "text-[#0d1954] bg-white shadow-sm border border-slate-200/60" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent"
                }`}
              >
                <Icon size={18} className={isActive ? "text-indigo-500" : "text-slate-400"} />
                {tab.label}
                
                {isActive && (
                  <motion.div 
                    layoutId="activeViewTabIndicator"
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#F8FAFC]"
                    transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* --- LAYER 3: DYNAMIC CONTENT GRID --- */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
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
                    // EXACT LOGIC MAINTAINED
                    onAdd={() => setSearchParams({ modal: "schedule-followup" }, { state: location.state })} 
                  />
                )}
                {activeTab === "Activity" && <ActivityTab activities={lead?.history || lead?.activityLogs} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4">
            <LeadStatusCard lead={lead} />
          </div>

        </motion.div>
      </div>

      {/* EXACT PROPS MAINTAINED */}
      <AddFollowUp_Modal 
        tableId={tableId} 
        selectedData={lead} 
      />
    </motion.div>
  );
};

/* Helper Components */
const InfoItem = ({ icon, label, value, color = "text-slate-800" }: any) => (
  <div className="flex gap-4 items-start p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-colors">
    <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-[#0d1954]">
      {icon}
    </div>
    <div>
      <p className="text-[11px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">{label}</p>
      <p className={`font-semibold text-sm ${color} break-all`}>{value || "N/A"}</p>
    </div>
  </div>
);

export default View_Leads;