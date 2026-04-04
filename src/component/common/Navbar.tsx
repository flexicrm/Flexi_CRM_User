import { motion } from "framer-motion";
import { Bell, ChevronRight, Clock, LogOut, UserCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, notificationAPI } from "../../store/Login_Slice";

interface NavbarProps {
  toggleMobileSidebar?: () => void;
  isSidebarExpanded?: boolean; // Changed from isSidebarCollapsed
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

const Navbar = ({ toggleMobileSidebar, isSidebarExpanded = false }: NavbarProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Get company info from localStorage
  const companyLogo = localStorage.getItem("companyLogo") || "/default-logo.png";
  const companyName = localStorage.getItem("companyName") || "FlexiCRM";

  // 🔁 CLOSE DROPDOWNS
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

  // 🔔 FETCH NOTIFICATIONS
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationAPI();
        const data: NotificationResponse = response?.data?.data;
        
        if (data) {
          setNotifications(data.activities || []);
          
          const unread = (data.activities || []).filter(
            (n) => !n.notificationRead
          ).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // 📅 FORMAT DATE & TIME
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

  // 🚪 LOGOUT HANDLER
  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/login");
  };

  // 🎨 GET ENTITY ICON & COLOR
  const getEntityIcon = (entityType: string) => {
    switch (entityType?.toLowerCase()) {
      case 'lead':
        return { icon: '👤', color: 'bg-blue-100', iconColor: 'text-blue-600' };
      case 'website':
        return { icon: '🌐', color: 'bg-green-100', iconColor: 'text-green-600' };
      case 'facebook':
        return { icon: '📘', color: 'bg-indigo-100', iconColor: 'text-indigo-600' };
      case 'offline':
        return { icon: '📱', color: 'bg-purple-100', iconColor: 'text-purple-600' };
      default:
        return { icon: '📌', color: 'bg-gray-100', iconColor: 'text-gray-600' };
    }
  };

  // Get user info from localStorage
  const userFirstname = localStorage.getItem("userFirstname") || "User";
  const userLastname = localStorage.getItem("userLastname") || "";
  const userInitial = userFirstname.charAt(0).toUpperCase();

  return (
    <nav className="bg-gradient-to-r from-[#0d1954] to-[#1a2a6c] px-4 py-3 sticky top-0 z-30 shadow-lg">
      <div className="flex items-center justify-between">
        {/* LEFT SECTION - Logo with Animation based on Sidebar Hover State */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          {toggleMobileSidebar && (
            <button
              onClick={toggleMobileSidebar}
              className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <ChevronRight size={20} />
            </button>
          )}
          
          {/* Logo Section with Animation */}
          <div className="flex items-center gap-3">
            {/* Logo Icon - Always visible */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                {companyLogo && companyLogo !== "/default-logo.png" ? (
                  <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/default-logo.png";
                    }}
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {companyName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Pulse ring animation when sidebar is expanded */}
              {isSidebarExpanded && (
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-xl border-2 border-blue-400"
                />
              )}
            </motion.div>

            {/* Company Name - Shows only when sidebar is expanded (hovered) */}
            <motion.div
              initial={false}
              animate={{
                opacity: isSidebarExpanded ? 1 : 0,
                width: isSidebarExpanded ? "auto" : 0,
                marginLeft: isSidebarExpanded ? "0.5rem" : 0,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden whitespace-nowrap"
            >
              <div className="flex flex-col">
                <h2 className="text-white font-semibold text-base leading-tight">
                  {companyName}
                </h2>
                <p className="text-blue-200 text-xs">CRM Dashboard</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3">
          {/* NOTIFICATIONS */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 cursor-pointer group"
            >
              <Bell size={20} className="transition-transform group-hover:scale-110" />
              
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-slideDown">
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-gray-50 to-white">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">Notifications</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        Mark all read
                      </button>
                    )}
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[480px] overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell size={28} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No notifications yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        You'll see notifications here when you get them
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const { icon, color, iconColor } = getEntityIcon(n.entityType);
                      return (
                        <div
                          key={n._id}
                          className={`p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer group relative ${
                            !n.notificationRead ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          {!n.notificationRead && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                          )}
                          
                          <div className="flex items-start gap-3 ml-1">
                            <div className="flex-shrink-0">
                              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl transition-transform group-hover:scale-105`}>
                                <span className={iconColor}>{icon}</span>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm ${!n.notificationRead ? 'font-semibold text-gray-900' : 'text-gray-700'} leading-relaxed`}>
                                  {n.description}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {formatDateTime(n.timestamp)}
                                </span>
                                
                                {n.actionType && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                                    n.actionType === 'Create' ? 'bg-green-100 text-green-700' :
                                    n.actionType === 'Update' ? 'bg-blue-100 text-blue-700' :
                                    'bg-purple-100 text-purple-700'
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
                  <div className="p-3 border-t bg-gray-50">
                    <button 
                      onClick={() => navigate('/notifications')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center flex items-center justify-center gap-2 py-2 hover:bg-blue-50 rounded-lg transition-all duration-200"
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
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-semibold text-sm">
                    {userInitial}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white ring-2 ring-green-400 ring-opacity-50"></div>
              </div>
              
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">
                  {userFirstname} {userLastname}
                </p>
                <p className="text-xs text-blue-200">
                  {localStorage.getItem("subdomain")}
                </p>
              </div>
            </div>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-slideDown">
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/profile");
                    }}
                    className="w-full px-5 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 group cursor-pointer"
                  >
                    <UserCircle size={18} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                    <span className="group-hover:translate-x-0.5 transition-transform">My Profile</span>
                  </button>

                  <div className="border-t my-1 border-gray-100"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-5 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-3 group cursor-pointer"
                  >
                    <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Logout</span>
                  </button>
                </div>

                <div className="px-5 py-3 border-t bg-gray-50">
                  <p className="text-xs text-gray-400 text-center">
                    Version 2.0.0 • © 2024
                  </p>
                </div>
              </div>
            )}
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
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;