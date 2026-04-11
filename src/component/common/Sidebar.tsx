import { motion } from "framer-motion";
import {
  BarChart, Bell, Box, Calendar, Copy, DollarSign, FileText, Flag, Folder,
  Grid, HelpCircle, Home, Key, LayoutDashboard, Link, List, LogOut, Mail,
  MessageSquare, Monitor, Package, Paperclip, PieChart, Repeat, Save, Search,
  Send, Settings, Shield, Shield as ShieldIcon, ShoppingCart, Sliders, Star,
  Star as StarIcon, Tag, Target, ThumbsUp, TrendingUp, Truck, User, UserPlus,
  UserRoundCog, Users, Video, Wrench
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { meAPI } from "../../store/Login_Slice";

interface Permission {
  module: string;
  canCreate: boolean;
  canRead: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface DynamicMenuItem {
  path: string;
  icon: React.ElementType;
  label: string;
  module: string;
  canRead: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface SidebarProps {
  onHoverChange?: (isHovered: boolean) => void;
}

// Modules to hide from sidebar
const HIDDEN_MODULES = [
  "ThemeSettings", "LeadStatus", "LeadSource", "LeadFollowupTypes", "LeadFollowupStatus"
];

const iconMap: Record<string, React.ElementType> = {
  Dashboard: LayoutDashboard, DashboardNew: LayoutDashboard, Home: Home, Customer: Users,
  Customers: Users, Client: Users, Clients: Users, Account: User, Accounts: Users,
  Contact: User, Contacts: Users, User: UserRoundCog, Users: UserRoundCog, Employee: User,
  Employees: Users, Staff: Users, Team: Users, Leads: Star, Lead: Star, Opportunity: Target,
  Opportunities: Target, Deal: DollarSign, Deals: DollarSign, Quote: FileText, Quotes: FileText,
  Order: ShoppingCart, Orders: ShoppingCart, Invoice: DollarSign, Invoices: DollarSign,
  Campaign: Send, Campaigns: Send, Marketing: TrendingUp, Email: Mail, EmailMarketing: Mail,
  SMS: MessageSquare, PushNotification: Bell, Newsletter: FileText, Support: HelpCircle,
  Ticket: Tag, Tickets: Tag, Complaint: Flag, Feedback: ThumbsUp, Review: StarIcon,
  Product: Package, Products: Package, Inventory: Box, Stock: Package, Warehouse: Truck,
  Supplier: Truck, Vendors: Truck, Finance: DollarSign, Accounting: DollarSign, Payment: DollarSign,
  Payments: DollarSign, Expense: DollarSign, Expenses: DollarSign, Budget: DollarSign,
  Analytics: BarChart, AnalyticsReport: BarChart, ReportAnalytics: BarChart, HR: Users,
  HumanResources: Users, Attendance: Calendar, Leave: Calendar, Payroll: DollarSign,
  Recruitment: UserPlus, Training: Monitor, Performance: TrendingUp, Project: Folder,
  Projects: Folder, Task: TrendingUp, Tasks: TrendingUp, Milestone: Flag, Timeline: Calendar,
  Settings: Settings, Setup: Settings, Configuration: Sliders, Preference: Sliders,
  RolesandPermissions: Shield, Roles: Shield, Permissions: Shield, Security: ShieldIcon,
  Utilities: Wrench, Tools: TrendingUp, Integration: Link, API: Key, Webhook: Repeat,
  Communication: MessageSquare, Chat: MessageSquare, Message: Mail, Notification: Bell,
  Alert: Bell, Document: FileText, Documents: FileText, File: Paperclip, Files: Paperclip,
  Template: Copy, Calendar: Calendar, Schedule: Calendar, Event: Calendar, Meeting: Video,
  Reports: BarChart, Statistics: PieChart, Stats: BarChart, ReportData: BarChart,
  ReportSummary: BarChart, System: Monitor, Database: Grid, Backup: Save, Log: List,
  Audit: Search, Default: Folder,
};

const getIconForModule = (moduleName: string): React.ElementType => {
  if (iconMap[moduleName]) return iconMap[moduleName];
  const lowerModule = moduleName.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (key.toLowerCase() === lowerModule) return icon;
  }
  return Folder;
};

const generatePath = (moduleName: string, subdomain: string): string => {
  const pathName = moduleName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  return `/${subdomain}/${pathName}`;
};

const formatLabel = (moduleName: string): string => {
  let formatted = moduleName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  formatted = formatted.replace(/And/g, '&');
  formatted = formatted.replace(/Permissions/g, 'Permissions');
  return formatted;
};

const menuOrder = [
  'Dashboard', 'Leads', 'Customer', 'User', 'Utilities', 'Settings', 'RolesandPermissions', 'Integration'
];

const Sidebar = ({ onHoverChange }: SidebarProps) => {
  const [, setPermissions] = useState<Permission[]>([]);
  const [menuItems, setMenuItems] = useState<DynamicMenuItem[]>([]);
  const [bottomItems, setBottomItems] = useState<DynamicMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); // Used to accurately track current active route
  const subdomain = localStorage.getItem("subdomain") || "default";
  const navRef = useRef<HTMLElement>(null);
  
  // Theme properties from Redux
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  const themeColor = primaryColor || '#3B82F6';

  // Base theme classes
  const theme = darkMode ? {
    sidebar: "bg-gray-900 border-gray-800",
    navLinkInactive: "text-gray-400",
    iconInactive: "text-gray-500",
    textColorDark: "text-gray-200",
    borderColor: "border-gray-800",
    tooltipBg: "bg-gray-800",
    tooltipText: "text-white",
    logoutHover: "hover:bg-red-900/20 hover:text-red-400",
    logoutIcon: "text-red-400",
    versionText: "text-gray-600",
  } : {
    sidebar: "bg-white border-slate-200",
    navLinkInactive: "text-slate-700",
    iconInactive: "text-slate-500",
    textColorDark: "text-slate-800",
    borderColor: "border-slate-200",
    tooltipBg: "bg-slate-800",
    tooltipText: "text-white",
    logoutHover: "hover:bg-red-50 hover:text-red-600",
    logoutIcon: "text-red-500",
    versionText: "text-slate-400",
  };

  useEffect(() => {
    if (onHoverChange) onHoverChange(isHovered);
  }, [isHovered, onHoverChange]);

  const handleScroll = () => {
    if (navRef.current) setShowScrollTop(navRef.current.scrollTop > 100);
  };

  const scrollToTop = () => {
    if (navRef.current) navRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await meAPI();
        let permissionsArray: Permission[] = [];
        localStorage.setItem("FirstName", response?.data?.data?.firstname || "");
        localStorage.setItem("LastName", response?.data?.data?.lastname || "");
        
        if (response.data?.data?.permissions && Array.isArray(response.data.data.permissions)) {
          permissionsArray = response.data.data.permissions;
        } else if (response.data?.permissions && Array.isArray(response.data.permissions)) {
          permissionsArray = response.data.permissions;
        } else if (Array.isArray(response.data)) {
          permissionsArray = response.data;
        }
        
        setPermissions(permissionsArray);
        
        const allMenuItems: DynamicMenuItem[] = [];
        const bottomMenuItems: DynamicMenuItem[] = [];
        
        permissionsArray.forEach((perm) => {
          if (HIDDEN_MODULES.includes(perm.module)) return;
          
          if (perm.canRead === true && perm.module) {
            const menuItem: DynamicMenuItem = {
              path: generatePath(perm.module, subdomain),
              icon: getIconForModule(perm.module),
              label: formatLabel(perm.module),
              module: perm.module,
              canRead: perm.canRead,
              canCreate: perm.canCreate,
              canEdit: perm.canEdit,
              canDelete: perm.canDelete,
            };
            
            if (perm.module === 'Settings' || perm.module === 'RolesandPermissions') {
              bottomMenuItems.push(menuItem);
            } else {
              allMenuItems.push(menuItem);
            }
          }
        });
        
        const sortedMenuItems = [...allMenuItems].sort((a, b) => {
          const indexA = menuOrder.indexOf(a.module);
          const indexB = menuOrder.indexOf(b.module);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.label.localeCompare(b.label);
        });
        
        const sortedBottomItems = [...bottomMenuItems].sort((a, b) => {
          const order = ['Settings', 'RolesandPermissions'];
          return order.indexOf(a.module) - order.indexOf(b.module);
        });
        
        setMenuItems(sortedMenuItems);
        setBottomItems(sortedBottomItems);
        
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Failed to load user permissions");
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [subdomain]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ROBUST ACTIVE PATH MATCHING
  // This ensures routing differences (like plural/singular or nested routes) don't break the active styling
  const isItemActive = (path: string, module: string) => {
    const current = location.pathname;
    if (current === path || current.startsWith(`${path}/`)) return true;
    
    // Fix: If on dashboard root (e.g. /subdomain/)
    if (module.toLowerCase().includes('dashboard') && (current === `/${subdomain}` || current === `/${subdomain}/`)) {
      return true;
    }

    // Fix: Singular vs Plural mismatches (e.g. module="Customer", url="/subdomain/customers")
    const currentBaseRoute = current.split('/')[2]; 
    const targetBaseRoute = path.split('/').pop() || '';
    if (currentBaseRoute && (currentBaseRoute === `${targetBaseRoute}s` || targetBaseRoute === `${currentBaseRoute}s`)) {
      return true;
    }

    return false;
  };

  if (loading) {
    return (
      <aside className={`${theme.sidebar} w-20 flex flex-col shadow-2xl ${theme.borderColor}`}>
        <div className="flex items-center justify-center h-full">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-t-transparent rounded-full"
            style={{ borderColor: themeColor, borderTopColor: 'transparent' }}
          />
        </div>
      </aside>
    );
  }

  if (error || (menuItems.length === 0 && bottomItems.length === 0)) return null;

  const sidebarVariants = { expanded: { width: "16rem" }, collapsed: { width: "5rem" } };
  const menuItemVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } };

  return (
    <>
      {/* GLOBAL DYNAMIC HOVER STYLES FOR LINKS */}
      <style>
        {`
          .nav-link-dynamic { transition: all 0.2s ease-in-out; }
          .nav-link-dynamic:not(.active-link):hover {
            background-color: ${darkMode ? `${themeColor}1A` : `${themeColor}0D`};
            color: ${themeColor};
          }
          .nav-link-dynamic:not(.active-link):hover svg {
            color: ${themeColor};
          }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: ${darkMode ? '#1f2937' : '#f1f1f1'}; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: ${darkMode ? '#4b5563' : '#c1c1c1'}; border-radius: 10px; }
        `}
      </style>

      <motion.aside
        initial="collapsed"
        animate={isHovered ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`relative ${theme.sidebar} flex flex-col shadow-xl z-20 ${theme.borderColor}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="h-4"></div>

        {/* TOP MENU ITEMS */}
        <nav 
          ref={navRef}
          className="flex-1 py-6 overflow-y-auto custom-scrollbar"
          onScroll={handleScroll}
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          <div className="px-3 space-y-1">
            {menuItems.map((item, index) => {
              const active = isItemActive(item.path, item.module);
              return (
                <motion.div
                  key={item.path}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                  transition={{ delay: index * 0.05 }}
                >
                  <NavLink
                    to={item.path}
                    className={`nav-link-dynamic flex items-center gap-3 px-3 py-2.5 rounded-lg relative group ${
                      active ? "active-link shadow-sm font-semibold" : theme.navLinkInactive
                    }`}
                    style={active ? {
                      backgroundColor: darkMode ? `${themeColor}33` : `${themeColor}1A`,
                      color: themeColor
                    } : {}}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeIndicator" // Shared layoutId so the bar slides seamlessly
                        className="absolute left-0 w-1 h-8 rounded-r-full"
                        style={{ backgroundColor: themeColor }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    
                    <item.icon 
                      className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${active ? "" : theme.iconInactive}`}
                      style={active ? { color: themeColor } : {}}
                    />
                    
                    <motion.span
                      className="whitespace-nowrap text-sm"
                      animate={{ opacity: isHovered ? 1 : 0, display: isHovered ? "inline-block" : "none" }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  </NavLink>
                </motion.div>
              );
            })}
          </div>
        </nav>

        {/* BOTTOM MENU ITEMS */}
        {bottomItems.length > 0 && (
          <div className={`border-t ${theme.borderColor} pt-4 pb-6 px-3 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="space-y-1">
              {bottomItems.map((item, index) => {
                const active = isItemActive(item.path, item.module);
                return (
                  <motion.div
                    key={item.path}
                    initial="hidden"
                    animate="visible"
                    variants={menuItemVariants}
                    transition={{ delay: (menuItems.length + index) * 0.05 }}
                  >
                    <NavLink
                      to={item.path}
                      className={`nav-link-dynamic flex items-center gap-3 px-3 py-2.5 rounded-lg relative group ${
                        active ? "active-link shadow-sm font-semibold" : theme.navLinkInactive
                      }`}
                      style={active ? {
                        backgroundColor: darkMode ? `${themeColor}33` : `${themeColor}1A`,
                        color: themeColor
                      } : {}}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeIndicator" // Same layoutId so the active bar animates here too
                          className="absolute left-0 w-1 h-8 rounded-r-full"
                          style={{ backgroundColor: themeColor }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                      
                      <item.icon 
                        className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${active ? "" : theme.iconInactive}`}
                        style={active ? { color: themeColor } : {}}
                      />
                      
                      <motion.span
                        className="whitespace-nowrap text-sm"
                        animate={{ opacity: isHovered ? 1 : 0, display: isHovered ? "inline-block" : "none" }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    </NavLink>
                  </motion.div>
                );
              })}

              {/* LOGOUT */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={menuItemVariants}
                transition={{ delay: (menuItems.length + bottomItems.length) * 0.05 }}
              >
                <button
                  onClick={handleLogout}
                  className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group ${theme.logoutHover}`}
                >
                  <LogOut className={`w-5 h-5 flex-shrink-0 ${theme.logoutIcon}`} />
                  
                  <motion.span
                    className={`whitespace-nowrap text-sm font-medium ${theme.textColorDark}`}
                    animate={{ opacity: isHovered ? 1 : 0, display: isHovered ? "inline-block" : "none" }}
                    transition={{ duration: 0.2 }}
                  >
                    Logout
                  </motion.span>
                </button>
              </motion.div>
            </div>
          </div>
        )}

        {/* SCROLL TO TOP BUTTON */}
        {showScrollTop && isHovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="absolute bottom-20 right-4 text-white p-2 rounded-full shadow-lg transition-all duration-200 z-10"
            style={{ backgroundColor: themeColor }}
            whileHover={{ scale: 1.1, filter: "brightness(1.1)" }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;