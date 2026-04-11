import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Flag,
  Globe,
  MessageCircle,
  Palette,
  RefreshCw,
  Settings2
} from "lucide-react";
import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";

import { successAlert } from "../../component/Notification/statusHandler";
import Color_Theems from "./Color_Theems";
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
  { id: "Color Theems", label: "Color Theems", icon: Palette, component: Color_Theems },
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

// --- Tooltip Component with Theme Support ---
const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => {
  const { darkMode } = useSelector((state: any) => state.theme);
  
  return (
    <div className="group relative flex flex-col items-center">
      {children}
      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 animate-in fade-in zoom-in-95 duration-200">
        <span className={`relative z-10 px-2 py-1 text-[10px] font-semibold text-white whitespace-nowrap shadow-md rounded-md ${
          darkMode ? 'bg-gray-800' : 'bg-slate-800'
        }`}>
          {text}
        </span>
        <div className={`w-2 h-2 -mt-1 rotate-45 rounded-sm ${
          darkMode ? 'bg-gray-800' : 'bg-slate-800'
        }`}></div>
      </div>
    </div>
  );
};

const Settings: React.FC = () => {
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  const [activeTab, setActiveTab] = useState(tabsConfig[0].id);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Theme-based styles
  const getPageBg = () => darkMode ? 'bg-gray-900' : 'bg-[#F8FAFC]';
  const getHeaderIconBg = () => darkMode ? 'bg-gray-700' : 'bg-indigo-100';
  const getHeaderIconColor = () => darkMode ? primaryColor || '#818CF8' : '#6366f1';
  const getTitleColor = () => darkMode ? 'text-white' : 'text-slate-900';
  const getSubtitleColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';
  const getSeparatorColor = () => darkMode ? 'bg-gray-600' : 'bg-slate-300';
  const getCountColor = () => darkMode ? 'text-gray-500' : 'text-slate-500';
  const getButtonBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getButtonBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200';
  const getButtonTextColor = () => darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600';
  const getButtonHoverBg = () => darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50';
  const getCardBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getCardBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200/60';
  const getTabBarBg = () => darkMode ? 'bg-gray-800/80' : 'bg-slate-50/80';
  const getTabBarBorder = () => darkMode ? 'border-gray-700' : 'border-slate-100';
  const getTabButtonBg = (isActive: boolean) => {
    if (isActive) {
      return darkMode ? 'bg-gray-700 border-gray-600 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-700';
    }
    return darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700 border-transparent' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent';
  };
  const getTabIconColor = (isActive: boolean) => {
    if (isActive) return darkMode ? primaryColor || '#818CF8' : '#6366f1';
    return darkMode ? 'text-gray-500' : 'text-slate-400';
  };
  const getTabIndicatorBg = () => darkMode ? primaryColor || '#818CF8' : '#6366f1';
  const getContentBg = () => darkMode ? 'bg-gray-800' : 'bg-white';

  // Handle refresh for the current tab
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    setRefreshKey(prev => prev + 1);
    
    setTimeout(() => {
      setIsRefreshing(false);
      successAlert(`${activeTab} data refreshed successfully!`, "Great", "Refreshed");
    }, 500);
  }, [activeTab]);

  const ActiveComponent = tabsConfig.find(tab => tab.id === activeTab)?.component;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`min-h-screen py-6 px-4 md:py-8 md:px-6 lg:px-8 transition-colors duration-300 ${getPageBg()}`}
    >
      <div className="w-full mx-auto space-y-6">
        
        {/* --- LAYER 1: HERO HEADER --- */}
        <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm ${getHeaderIconBg()}`}>
              <Settings2 size={20} strokeWidth={2.5} className="md:w-6 md:h-6" style={{ color: getHeaderIconColor() }} />
            </div>
            <div>
              <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold tracking-tight ${getTitleColor()}`}>System Settings</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className={`text-xs md:text-sm ${getSubtitleColor()}`}>Configure global parameters, dropdowns, and statuses.</p>
                <span className={`w-1 h-1 rounded-full hidden sm:block ${getSeparatorColor()}`}></span>
                <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider hidden sm:block ${getCountColor()}`}>
                  {activeTab}
                </p>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <Tooltip text={`Refresh Data`}>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg shadow-sm border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getButtonBg()} ${getButtonBorder()} ${getButtonTextColor()} ${getButtonHoverBg()}`}
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </Tooltip>
        </motion.header>

        {/* --- LAYER 2: UNIFIED DATA CARD --- */}
        <motion.main variants={itemVariants} className={`rounded-xl md:rounded-2xl shadow-sm border overflow-hidden flex flex-col ${getCardBg()} ${getCardBorder()}`}>
          
          {/* Enhanced Tab Navigation - Compact */}
          <div className={`border-b px-4 pt-2 pb-0 ${getTabBarBg()} ${getTabBarBorder()}`}>
            <div className="flex overflow-x-auto custom-scrollbar hide-scrollbar gap-1.5 pt-3 mb-2">
              {tabsConfig.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={isRefreshing}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${getTabButtonBg(isActive)} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Icon size={13} style={{ color: getTabIconColor(isActive) }} />
                    {tab.label}
                    
                    {/* Active State Indicator */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white"
                        style={{ backgroundColor: getTabIndicatorBg() }}
                        transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Content Area with Smooth Transitions - Compact */}
          <div className={`p-4 min-h-[350px] ${getContentBg()}`}>
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