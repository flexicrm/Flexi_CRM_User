import { motion } from "framer-motion";
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowUpCircle,
  Building2,
  Calendar,
  Clock,
  Globe, Loader2,
  Mail, MessageSquare,
  MinusCircle,
  MonitorPlay,
  Phone, User,
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

/* ================= COMPONENT: LEAD STATUS CARD (RIGHT SIDE) ================= */
const LeadStatusCard = ({ lead }: any) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-fit sticky top-6">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl font-bold text-[#0d1954]">Lead Status</h3>
      <span 
        className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
        style={{ color: lead?.leadstatus?.color || '#0d1954', borderColor: lead?.leadstatus?.color }}
      >
        {lead?.leadstatus?.statusName || "N/A"}
      </span>
    </div>

    <div className="space-y-6">
      <StatusRow 
        label="Potential Value" 
        value={lead?.manualData?.potentialValue || lead?.potentialValue ? `₹${lead?.manualData?.potentialValue || lead?.potentialValue}` : "₹0"} 
        isValue 
      />
      <hr className="border-slate-100" />
      <StatusRow 
        label="Created Date" 
        value={lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"} 
      />
      <hr className="border-slate-100" />
      <StatusRow label="Last Activity" value={lead?.lastActivity || "Today"} />
      <hr className="border-slate-100" />
      <StatusRow 
        label="Owner" 
        value={lead?.ownerDetails?.name || lead?.owner?.firstname || lead?.owner || "N/A"} 
        color="text-indigo-600" 
      />
    </div>
  </div>
);

const StatusRow = ({ label, value, isValue, color = "text-slate-600" }: any) => (
  <div className="flex justify-between items-center">
    <span className="text-sm font-medium text-slate-500">{label}</span>
    <span className={`text-sm font-bold ${isValue ? "text-[#0d1954] text-base" : color}`}>{value}</span>
  </div>
);

/* ================= TAB 1: OVERVIEW ================= */
const OverviewTab = ({ lead }: any) => (
  <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-[400px]">
    <h3 className="text-2xl font-black text-[#0d1954] mb-10">Contact Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
      <InfoItem icon={<User size={20} className="text-slate-400" />} label="Full Name" value={lead?.manualData?.name || 'N/A'} />
      <InfoItem icon={<Mail size={20} className="text-slate-400" />} label="Email" value={lead?.manualData?.email || 'N/A'} color="text-indigo-600" />
      <InfoItem icon={<Phone size={20} className="text-slate-400" />} label="Phone" value={lead?.manualData?.mobileNo || 'N/A'} />
      <InfoItem icon={<Building2 size={20} className="text-slate-400" />} label="Company" value={lead?.manualData?.company || 'N/A'} color="text-indigo-600" />
      <InfoItem icon={<Globe size={20} className="text-slate-400" />} label="Website" value={lead?.manualData?.website || 'N/A'} color="text-indigo-600" />
      <InfoItem icon={<MessageSquare size={20} className="text-slate-400" />} label="Notes" value={lead?.notes?.[0] || lead?.description || 'No notes available'} />
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
    // Safely extract string whether it's an object or string
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
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-[400px]">
      <div className="flex justify-between items-start mb-8">
        <h3 className="text-2xl font-black text-[#0d1954]">Follow-Ups</h3>
      </div>

      <div className="w-full md:w-64 mb-8">
        <Reusable_Fields
          type="select"
          label="Filter by Status"
          name="fStatus"
          value={selectedFilter}
          onChange={(e: any) => setSelectedFilter(e.target.value)}
          options={filterOptions}
        />
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
                className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between min-h-[160px] ${getPriorityBorder(followup.priority)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <TypeIcon type={followup?.type} />
                    <h4 className="font-bold text-[#0d1954] text-sm">
                      {followup?.leadStatus?.StatusName || followup?.leadStatus?.statusName || 'No Title'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityChip priority={followup.priority} />
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{ 
                        backgroundColor: `${followup?.status?.color || '#cbd5e1'}20`, 
                        color: followup?.status?.color || '#475569',
                        borderColor: followup?.status?.color || '#cbd5e1' 
                      }}
                    >
                      {followup?.status?.StatusName || 'Pending'}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Calendar size={14} /> Due: {followup.dueDate ? new Date(followup.dueDate).toLocaleDateString() : 'Not set'}
                </p>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{followup.notes}</p>
                
                <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] font-semibold text-slate-400">
                  <span>Created: {followup.createdAt ? new Date(followup.createdAt).toLocaleDateString() : '—'}</span>
                  {followup.assignTo?.length > 0 && (
                     <span className="flex items-center gap-1">
                       <User size={12} /> {followup.assignTo.map((u: any) => u.firstname || u.name).join(', ')}
                     </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
          <Clock className="text-slate-200 mb-4" size={48} />
          <p className="text-slate-500 font-bold mb-4">No follow-ups scheduled</p>
          <Reusable_Button
            text="Schedule First Follow-Up"
            variant="outline"
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
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-[400px]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black text-[#0d1954]">Activity Timeline</h3>
          <p className="text-slate-400 text-sm font-medium mt-1">Recent interactions with this lead</p>
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
                  <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 border-white ${index === 0 ? 'bg-[#0d1954]' : 'bg-slate-300'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2`}></div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-3rem)] bg-slate-50 border border-slate-100 p-5 rounded-2xl ml-12 md:ml-0 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-2">
                          <h4 className="text-[#0d1954] font-black text-sm capitalize">
                            {activity.actionType || activity.type || 'Activity'}
                          </h4>
                          <time className="font-bold text-[11px] text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">
                            {activity.timestamp || activity.createdAt ? new Date(activity.timestamp || activity.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date N/A'}
                          </time>
                      </div>
                      <div className="text-slate-600 text-xs mt-1 font-medium leading-relaxed">
                        {activity.description || activity.message || 'No description provided'}
                      </div>
                  </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-10">
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
            <p className="text-slate-400 text-xs font-bold bg-slate-50 py-2 rounded-lg border border-slate-100 max-w-[200px] mx-auto">No more activities to load</p>
        </div>
      )}
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */
const View_Leads = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("Overview");

  const location = useLocation();
  const { tableId } = location.state || {};
  console.log("View_Leads rendered with tableId:", tableId); // Debug log

  const lead = useSelector((state: any) => state.leads.viewLead);
  const statusList = useSelector((state: any) => state.leads.followUpStatuses);
  const loading = useSelector((state: any) => state.leads.loading);

  useEffect(() => {
    if (tableId) {
      dispatch(getViewPage(tableId) as any);
      dispatch(addFollowUp_status() as any);
    }
  }, [tableId, dispatch]);

  // Handle edit lead - send data similar to Table_View
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="animate-spin text-[#0d1954]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <Reusable_Button
              text="Back to Leads"
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              icon={<ArrowLeft size={18} />}
              iconPosition="left"
            />
            <h1 className="text-4xl font-black text-[#0d1954] mb-3 tracking-tight mt-3">{lead?.manualData?.name || 'N/A'}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <Building2 size={16} className="text-[#0d1954]" /> {lead?.manualData?.company || 'N/A'}
              </div>
              <span
                style={{ backgroundColor: `${lead?.leadstatus?.color || '#3b82f6'}15`, color: lead?.leadstatus?.color || '#3b82f6', borderColor: `${lead?.leadstatus?.color || '#3b82f6'}40` }}
                className="px-3 py-1.5 rounded-lg text-xs font-black border"
              >
                {lead?.leadstatus?.statusName || "New"}
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
            <Reusable_Button
              text="Edit Lead"
              variant="outline"
              size="md"
              onClick={handleEditLead}
              icon={<User size={16} />}
              fullWidth={false}
            />
            <Reusable_Button
              text="Schedule Follow-Up"
              variant="primary"
              size="md"
              onClick={() => setSearchParams({ modal: "schedule-followup" }, { state: location.state })}
              icon={<Calendar size={16} />}
              fullWidth={false}
            />
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-2 p-1.5 bg-slate-200/50 w-full md:w-fit rounded-xl mb-8 overflow-x-auto">
          {["Overview", "Followups", "Activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-8 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === tab 
                ? "bg-white text-[#0d1954] shadow-sm border border-slate-200/50" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TWO COLUMN CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "Overview" && <OverviewTab lead={lead} />}
              {activeTab === "Followups" && (
                <FollowupsTab 
                  followUps={lead?.followUps} 
                  statuses={statusList} 
                  onAdd={() => setSearchParams({ modal: "schedule-followup" })} 
                />
              )}
              {activeTab === "Activity" && <ActivityTab activities={lead?.history || lead?.activityLogs} />}
            </motion.div>
          </div>

          <div className="lg:col-span-4">
            <LeadStatusCard lead={lead} />
          </div>
        </div>
      </div>

      <AddFollowUp_Modal tableId={tableId} />
    </div>
  );
};

/* Helper Components */
const InfoItem = ({ icon, label, value, color = "text-slate-800" }: any) => (
  <div className="flex gap-4 items-start p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
    <div className="mt-1 p-2 bg-slate-100/80 rounded-lg text-[#0d1954]">{icon}</div>
    <div>
      <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">{label}</p>
      <p className={`font-bold text-base ${color} break-all`}>{value || "N/A"}</p>
    </div>
  </div>
);

export default View_Leads;