import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Flag,
  Globe,
  MessageCircle,
  Settings2
} from "lucide-react";
import React, { useState } from "react";

import LeadStatus from "./FollowupLeadStatus";
import FollowupStatus from "./FollowupStatus";
import FollowupType from "./FollowupType";
import LeadSource from "./LeadSource";

// --- Tab Configuration ---
const tabsConfig = [
  { id: "Follow-up Type", label: "Follow-up Type", icon: MessageCircle },
  { id: "Follow-up Status", label: "Follow-up Status", icon: Activity },
  { id: "Lead Status", label: "Lead Status", icon: Flag },
  { id: "Lead Source", label: "Lead Source", icon: Globe },
];

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

// Smooth fade & slide for tab content (FIXED)
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

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabsConfig[0].id);

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
              <Settings2 size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
              <p className="text-sm text-slate-500 mt-1">Configure global parameters, dropdowns, and statuses.</p>
            </div>
          </div>
        </motion.header>

        {/* --- LAYER 2: UNIFIED DATA CARD --- */}
        <motion.main variants={itemVariants} className="bg-white rounded-3xl shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-slate-200/60 overflow-hidden flex flex-col">
          
          {/* Enhanced Tab Navigation */}
          <div className="bg-slate-50/80 border-b border-slate-100 px-6 pt-4 pb-0">
            <div className="flex overflow-x-auto custom-scrollbar hide-scrollbar gap-2 pb-4">
              {tabsConfig.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                      isActive 
                        ? "text-indigo-700 bg-indigo-50 shadow-sm border border-indigo-100" 
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-indigo-500" : "text-slate-400"} />
                    {tab.label}
                    
                    {/* Active State Indicator (Animated Dot) */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white"
                        transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Content Area with Smooth Transitions */}
          <div className="p-6 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="h-full"
              >
                {activeTab === "Follow-up Type" && <FollowupType />}
                {activeTab === "Follow-up Status" && <FollowupStatus />}
                {activeTab === "Lead Status" && <LeadStatus />}
                {activeTab === "Lead Source" && <LeadSource />}
              </motion.div>
            </AnimatePresence>
          </div>
          
        </motion.main>
      </div>
    </motion.div>
  );
};

export default Settings;