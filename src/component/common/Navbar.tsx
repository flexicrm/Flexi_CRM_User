import { unwrapResult } from "@reduxjs/toolkit";
import { Bell, ChevronRight, Clock, LogOut, Moon, Sun, UserCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import favIconForFlexi from "../../assets/logo/favIconForFlexi.png";
import { errorAlert } from "../../component/Notification/statusHandler";
import { Reusable_Service } from "../../service/Reusable_Service/Reusable_Service";
import { logout, notificationAPI } from "../../store/Login_Slice";
import type { AppDispatch } from "../../store/Store";
import { toggleDarkModeAndSave } from "../../store/Theems_Slic";

interface NavbarProps {
  toggleMobileSidebar?: () => void;
  isSidebarExpanded?: boolean;
}

interface Notification {
  _id: string;
  actionType: string;
  description: string;
  entityId: string | { _id: string; LeadId?: string };
  entityType: string;
  notificationRead: boolean;
  timestamp: string;
  userId: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  __v: number;
}

interface NotificationResponse {
  count: number;
  activities: Notification[];
}

const Navbar = ({ toggleMobileSidebar }: NavbarProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Get theme settings from Redux
  const { primaryColor, darkMode, isLoading } = useSelector((state: any) => state.theme);
  const themeColor = primaryColor || '#3B82F6'; // Fallback color

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  
  // New state to manage the blinking dot behavior
  const [hasNewIndicator, setHasNewIndicator] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get company info from localStorage
  const companyName = localStorage.getItem("companyName") || "FlexiCRM";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications function
  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI();
      const data: NotificationResponse = response?.data?.data;
      
      if (data) {
        const newNotifications = data.activities || [];
        setNotifications(newNotifications);
        
        const unread = newNotifications.filter(
          (n) => !n.notificationRead
        ).length;
        setUnreadCount(unread);
        
        // --- BLINKING DOT LOGIC ---
        if (newNotifications.length > 0) {
          const latestDataTimestamp = new Date(newNotifications[0].timestamp).getTime();
          const lastViewed = localStorage.getItem("lastViewedTimestamp");
          
          // If there is no previous record, or if the newest notification is newer than our last viewed timestamp
          if (!lastViewed || latestDataTimestamp > Number(lastViewed)) {
            // Only make it blink if the dropdown is currently closed
            if (!showNotifications) {
              setHasNewIndicator(true);
            } else {
              // If dropdown is already open, just update the viewed timestamp quietly
              localStorage.setItem("lastViewedTimestamp", latestDataTimestamp.toString());
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Toggle Notifications and Stop Blinking
  const toggleNotifications = () => {
    const isOpening = !showNotifications;
    setShowNotifications(isOpening);
    
    if (isOpening) {
      // User opened the dropdown: stop blinking and record the current time as "seen"
      setHasNewIndicator(false);
      if (notifications.length > 0) {
        const latestDataTimestamp = new Date(notifications[0].timestamp).getTime();
        localStorage.setItem("lastViewedTimestamp", latestDataTimestamp.toString());
      }
    }
  };

  // Mark single notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const subdomain = localStorage.getItem("subdomain");
      const api = Reusable_Service();
      await api.put(`/activity/mark-read/${subdomain}/${notificationId}`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId 
            ? { ...n, notificationRead: true }
            : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (isMarkingRead || unreadCount === 0) return;
    
    setIsMarkingRead(true);
    try {
      const subdomain = localStorage.getItem("subdomain");
      const api = Reusable_Service();
      await api.put(`/activity/mark-all-read/${subdomain}`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, notificationRead: true }))
      );
      setUnreadCount(0);
      
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      errorAlert("Failed to mark notifications as read", "Try Again");
    } finally {
      setIsMarkingRead(false);
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    // Initial fetch
    fetchNotifications();
    
    // Set up polling
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 30000); // Poll every 30 seconds
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Listen for new notification events (e.g., from WebSocket or SSE)
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      console.log("New notification received:", event.detail);
      
      // Fetch latest notifications to check timestamps and update UI
      fetchNotifications();
      
      // Optional: Show browser notification
      if (Notification.permission === "granted" && !showNotifications) {
        const notification = new Notification("New Notification", {
          body: event.detail?.description || "You have a new notification",
          icon: favIconForFlexi,
        });
        
        notification.onclick = () => {
          window.focus();
          setShowNotifications(true);
          setHasNewIndicator(false);
        };
      }
    };
    
    window.addEventListener('new-notification', handleNewNotification as EventListener);
    
    return () => {
      window.removeEventListener('new-notification', handleNewNotification as EventListener);
    };
  }, [showNotifications]);

  // Format date & time
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;
      
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minutesStr} ${ampm}`;
    }
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Logout handler
  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/login");
  };

  // Handle dark mode toggle with API call
  const handleDarkModeToggle = async () => {
    try {
      const actionResult = await dispatch(toggleDarkModeAndSave());
      unwrapResult(actionResult);
    
    } catch (error: any) {
      console.error("Failed to toggle dark mode:", error);
      const errorMsg = typeof error === 'string' ? error : "Failed to switch theme. Please try again.";
      errorAlert(errorMsg, "Try Again");
    }
  };

  // Get entity icon & color
  const getEntityIcon = (entityType: string) => {
    switch (entityType?.toLowerCase()) {
      case 'lead':
        return { icon: '👤', color: darkMode ? 'bg-blue-900/30' : 'bg-blue-100', iconColor: darkMode ? 'text-blue-400' : 'text-blue-600' };
      case 'website':
        return { icon: '🌐', color: darkMode ? 'bg-green-900/30' : 'bg-green-100', iconColor: darkMode ? 'text-green-400' : 'text-green-600' };
      case 'facebook':
        return { icon: '📘', color: darkMode ? 'bg-indigo-900/30' : 'bg-indigo-100', iconColor: darkMode ? 'text-indigo-400' : 'text-indigo-600' };
      case 'offline':
        return { icon: '📱', color: darkMode ? 'bg-purple-900/30' : 'bg-purple-100', iconColor: darkMode ? 'text-purple-400' : 'text-purple-600' };
      default:
        return { icon: '📌', color: darkMode ? 'bg-gray-800' : 'bg-gray-100', iconColor: darkMode ? 'text-gray-400' : 'text-gray-600' };
    }
  };

  // Get user info from localStorage
  const userFirstname = localStorage.getItem("FirstName") || "User";
  const userInitial = userFirstname.charAt(0).toUpperCase();
  const userFullName = `${localStorage.getItem("FirstName") || ""} ${localStorage.getItem("LastName") || ""}`.trim();

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.notificationRead) {
      await markNotificationAsRead(notification._id);
    }
    
    // Close dropdown
    setShowNotifications(false);
    
    // Navigate based on entity type
    if (notification.entityType?.toLowerCase() === 'lead') {
      let mainId = '';
      let leadId = '';

      if (notification.entityId && typeof notification.entityId === 'object') {
        mainId = notification.entityId._id;
        leadId = notification.entityId.LeadId || '';
      } else if (typeof notification.entityId === 'string') {
        mainId = notification.entityId;
      }

      if (mainId) {
        navigate(`/${localStorage.getItem('subdomain')}/leads/view-leads`, {
          state: { tableId: leadId, mainId: mainId }
        });
      }
    }
  };

  return (
    <nav className={`sticky top-0 z-30 shadow-lg transition-all duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* LEFT SECTION - Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            {toggleMobileSidebar && (
              <button
                onClick={toggleMobileSidebar}
                className={`lg:hidden p-2 rounded-lg transition-all duration-200 ${
                  darkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            )}
            
            {/* Logo Section */}
            <div onClick={() => navigate("/dashboard")} className="flex items-center gap-3 cursor-pointer">
              <div className="h-6 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  {/* Logo Circle */}
                  <span className="text-white font-bold text-sm bg-gray-100 p-0.5 rounded-md flex items-center">
                    <img
                      src={favIconForFlexi}
                      alt="FlexiCRM"
                      className="w-8 h-8 mx-auto rounded-full"
                    />
                  </span>

                  {/* Company Name */}
                  <div className="leading-tight flex items-center gap-2">
                    <p 
                      className="text-lg font-extrabold tracking-tight"
                      style={{ color: themeColor }}
                    >
                      {companyName}
                    </p>
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${
                      darkMode ? 'text-gray-500' : 'text-slate-400'
                    }`}>
                      CRM SYSTEM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3">
            {/* DARK MODE TOGGLE BUTTON */}
            <button
              onClick={handleDarkModeToggle}
              disabled={isLoading}
              className={`relative p-2 rounded-lg transition-all duration-200 cursor-pointer group ${
                darkMode 
                  ? 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-800' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isLoading ? (
                <div 
                  className="w-5 h-5 border-2 rounded-full animate-spin"
                  style={{ borderColor: themeColor, borderTopColor: 'transparent' }}
                ></div>
              ) : darkMode ? (
                <Sun size={20} className="transition-transform group-hover:scale-110" />
              ) : (
                <Moon size={20} className="transition-transform group-hover:scale-110" />
              )}
            </button>

            {/* NOTIFICATIONS */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={toggleNotifications}
                className={`relative p-2 rounded-lg transition-all duration-200 cursor-pointer group ${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell size={20} className="transition-transform group-hover:scale-110" />
                
                {/* Notification dot - only shows and blinks when there are genuinely NEW un-viewed notifications */}
                {hasNewIndicator && (
                  <span className="absolute top-0 right-0 flex h-3 w-3">
                    <span 
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: themeColor }}
                    ></span>
                    <span 
                      className="relative inline-flex rounded-full h-3 w-3"
                      style={{ backgroundColor: themeColor }}
                    ></span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className={`absolute right-0 mt-3 w-96 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slideDown ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className={`flex items-center justify-between p-4 border-b ${
                    darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gradient-to-r from-gray-50 to-white'
                  }`}>
                    <div>
                      <h3 className={`font-semibold text-lg ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        Notifications
                      </h3>
                      <p className={`text-xs mt-0.5 ${
                        darkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          disabled={isMarkingRead}
                          className={`text-xs font-medium hover:opacity-80 transition-opacity ${
                            isMarkingRead ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          style={{ color: themeColor }}
                        >
                          {isMarkingRead ? 'Marking...' : 'Mark all read'}
                        </button>
                      )}
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className={`p-1 rounded-lg transition-colors ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <X size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                      </button>
                    </div>
                  </div>

                  <div className={`max-h-[480px] overflow-y-auto divide-y ${
                    darkMode ? 'divide-gray-700' : 'divide-gray-100'
                  }`}>
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <Bell size={28} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                        </div>
                        <p className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No notifications yet
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                          You'll see notifications here when you get them
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const { icon, color, iconColor } = getEntityIcon(n.entityType);
                        return (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-4 transition-all duration-200 cursor-pointer group relative ${
                              !n.notificationRead 
                                ? darkMode ? 'bg-gray-700/30' : 'bg-slate-50/50'
                                : darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                            }`}
                          >
                            {!n.notificationRead && (
                              <div 
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-r-full"
                                style={{ backgroundColor: themeColor }}
                              ></div>
                            )}
                            
                            <div className="flex items-start gap-3 ml-1">
                              <div className="flex-shrink-0">
                                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl transition-transform group-hover:scale-105`}>
                                  <span className={iconColor}>{icon}</span>
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm leading-relaxed ${
                                    !n.notificationRead 
                                      ? `font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`
                                      : darkMode ? 'text-gray-300' : 'text-gray-700'
                                  }`}>
                                    {n.description}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <Clock size={12} className={darkMode ? 'text-gray-600' : 'text-gray-400'} />
                                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {formatDateTime(n.timestamp)}
                                  </span>
                                  
                                  {n.actionType && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                                      n.actionType === 'Create' 
                                        ? darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
                                        : n.actionType === 'Update'
                                        ? darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'
                                        : darkMode ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-700'
                                    }`}>
                                      {n.actionType}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className={`p-3 border-t ${
                      darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
                    }`}>
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          navigate(`/${localStorage.getItem('subdomain')}/notification`);
                        }}
                        className={`text-sm font-medium w-full text-center flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-200 ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
                        }`}
                        style={{ color: themeColor }}
                      >
                        View all notifications
                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PROFILE */}
            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="hidden md:block text-left">
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-gray-200' : 'text-slate-900'
                  }`}>
                    {userFullName || "User"}
                  </p>
                </div>
                <div className="relative">
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200"
                    style={{ background: `linear-gradient(to bottom right, ${themeColor}, ${themeColor}dd)` }}
                  >
                    <span className="text-white font-semibold text-sm">
                      {userInitial}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white ring-2 ring-green-400 ring-opacity-50"></div>
                </div>
              </div>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className={`absolute right-0 mt-3 w-52 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slideDown ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate(`/${localStorage.getItem('subdomain')}/profile`);
                      }}
                      className={`w-full px-5 py-3 text-left transition-colors duration-200 flex items-center gap-3 group cursor-pointer ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <UserCircle size={18} className={`transition-colors ${
                        darkMode ? 'text-gray-500' : 'text-gray-500'
                      }`} />
                      <span className="group-hover:translate-x-0.5 transition-transform">My Profile</span>
                    </button>

                    <div className={`border-t my-1 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}></div>

                    <button
                      onClick={handleLogout}
                      className={`w-full px-5 py-3 text-left transition-colors duration-200 flex items-center gap-3 group cursor-pointer ${
                        darkMode 
                          ? 'text-red-400 hover:bg-red-900/20' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                      <span>Logout</span>
                    </button>
                  </div>

                  <div className={`px-5 py-3 border-t ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                    <p className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Version 2.0.0 • © 2024
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: ${darkMode ? '#1f2937' : '#f1f1f1'};
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4b5563' : '#c1c1c1'};
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#6b7280' : '#a8a8a8'};
        }
      `}</style>
    </nav>
  );
};

export default Navbar;