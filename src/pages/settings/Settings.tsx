import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Flag,
  Globe,
  MessageCircle,
  RefreshCw,
  Settings2
} from "lucide-react";
import React, { useCallback, useState } from "react";

import { successAlert } from "../../component/Notification/statusHandler";
import LeadStatus from "./FollowupLeadStatus";
import FollowupStatus from "./FollowupStatus";
import FollowupType from "./FollowupType";
import LeadSource from "./LeadSource";

// --- Tab Configuration ---
const tabsConfig = [
  { id: "Follow-up Type", label: "Follow-up Type", icon: MessageCircle, component: FollowupType },
  { id: "Follow-up Status", label: "Follow-up Status", icon: Activity, component: FollowupStatus },
  { id: "Lead Status", label: "Lead Status", icon: Flag, component: LeadStatus },
  { id: "Lead Source", label: "Lead Source", icon: Globe, component: LeadSource },
];

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

// Smooth fade & slide for tab content
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

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabsConfig[0].id);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle refresh for the current tab
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Increment refresh key to trigger component remount/refresh
    setRefreshKey(prev => prev + 1);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      setIsRefreshing(false);
      successAlert(`${activeTab} data refreshed successfully!`, "Great", "Refreshed");
    }, 500);
  }, [activeTab]);

  // Get the current active component
  const ActiveComponent = tabsConfig.find(tab => tab.id === activeTab)?.component;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#F8FAFC] py-6 px-4 md:py-8 md:px-6 lg:px-8"
    >
      <div className="w-full mx-auto space-y-6">
        
        {/* --- LAYER 1: HERO HEADER --- */}
        <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
              <Settings2 size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs md:text-sm text-slate-500">Configure global parameters, dropdowns, and statuses.</p>
                <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
                <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block">
                  {activeTab}
                </p>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <Tooltip text={`Refresh ${activeTab}`}>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </Tooltip>
        </motion.header>

        {/* --- LAYER 2: UNIFIED DATA CARD --- */}
        <motion.main variants={itemVariants} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
          
          {/* Enhanced Tab Navigation - Compact */}
          <div className="bg-slate-50/80 border-b border-slate-100 px-4 pt-2 pb-0">
            <div className="flex overflow-x-auto custom-scrollbar hide-scrollbar gap-1.5 pt-3">
              {tabsConfig.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={isRefreshing}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${
                      isActive 
                        ? "text-indigo-700 bg-indigo-50 shadow-sm border border-indigo-100" 
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Icon size={13} className={isActive ? "text-indigo-500" : "text-slate-400"} />
                    {tab.label}
                    
                    {/* Active State Indicator */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"
                        transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Content Area with Smooth Transitions - Compact */}
          <div className="p-4 min-h-[350px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${refreshKey}`}
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="h-full"
              >
                {ActiveComponent && <ActiveComponent key={refreshKey} />}
              </motion.div>
            </AnimatePresence>
          </div>
          
        </motion.main>
      </div>
    </motion.div>
  );
};

export default Settings;