import { motion } from "framer-motion";
import {
  BarChart,
  Bell,
  Box,
  Calendar,
  Copy,
  DollarSign,
  FileText,
  Flag,
  Folder,
  Grid,
  HelpCircle,
  Home,
  Key,
  LayoutDashboard,
  Link,
  List,
  LogOut,
  Mail,
  MessageSquare,
  Monitor,
  Package,
  Paperclip,
  PieChart,
  Repeat,
  Save,
  Search,
  Send,
  Settings,
  Shield,
  Shield as ShieldIcon,
  ShoppingCart,
  Sliders,
  Star,
  Star as StarIcon,
  Tag,
  Target,
  ThumbsUp,
  TrendingUp,
  Truck,
  User,
  UserPlus,
  UserRoundCog,
  Users,
  Video,
  Wrench
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

// Comprehensive icon mapping for all possible modules
const iconMap: Record<string, React.ElementType> = {
  Dashboard: LayoutDashboard,
  DashboardNew: LayoutDashboard,
  Home: Home,
  Customer: Users,
  Customers: Users,
  Client: Users,
  Clients: Users,
  Account: User,
  Accounts: Users,
  Contact: User,
  Contacts: Users,
  User: UserRoundCog,
  Users: UserRoundCog,
  Employee: User,
  Employees: Users,
  Staff: Users,
  Team: Users,
  Leads: Star,
  Lead: Star,
  Opportunity: Target,
  Opportunities: Target,
  Deal: DollarSign,
  Deals: DollarSign,
  Quote: FileText,
  Quotes: FileText,
  Order: ShoppingCart,
  Orders: ShoppingCart,
  Invoice: DollarSign,
  Invoices: DollarSign,
  Campaign: Send,
  Campaigns: Send,
  Marketing: TrendingUp,
  Email: Mail,
  EmailMarketing: Mail,
  SMS: MessageSquare,
  PushNotification: Bell,
  Newsletter: FileText,
  Support: HelpCircle,
  Ticket: Tag,
  Tickets: Tag,
  Complaint: Flag,
  Feedback: ThumbsUp,
  Review: StarIcon,
  Product: Package,
  Products: Package,
  Inventory: Box,
  Stock: Package,
  Warehouse: Truck,
  Supplier: Truck,
  Vendors: Truck,
  Finance: DollarSign,
  Accounting: DollarSign,
  Payment: DollarSign,
  Payments: DollarSign,
  Expense: DollarSign,
  Expenses: DollarSign,
  Budget: DollarSign,
  Analytics: BarChart,
  AnalyticsReport: BarChart,
  ReportAnalytics: BarChart,
  HR: Users,
  HumanResources: Users,
  Attendance: Calendar,
  Leave: Calendar,
  Payroll: DollarSign,
  Recruitment: UserPlus,
  Training: Monitor,
  Performance: TrendingUp,
  Project: Folder,
  Projects: Folder,
  Task: TrendingUp,
  Tasks: TrendingUp,
  Milestone: Flag,
  Timeline: Calendar,
  Settings: Settings,
  Setup: Settings,
  Configuration: Sliders,
  Preference: Sliders,
  RolesandPermissions: Shield,
  Roles: Shield,
  Permissions: Shield,
  Security: ShieldIcon,
  Utilities: Wrench,
  Tools: TrendingUp,
  Integration: Link,
  API: Key,
  Webhook: Repeat,
  Communication: MessageSquare,
  Chat: MessageSquare,
  Message: Mail,
  Notification: Bell,
  Alert: Bell,
  Document: FileText,
  Documents: FileText,
  File: Paperclip,
  Files: Paperclip,
  Template: Copy,
  Calendar: Calendar,
  Schedule: Calendar,
  Event: Calendar,
  Meeting: Video,
  Reports: BarChart,
  Statistics: PieChart,
  Stats: BarChart,
  ReportData: BarChart,
  ReportSummary: BarChart,
  System: Monitor,
  Database: Grid,
  Backup: Save,
  Log: List,
  Audit: Search,
  Default: Folder,
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
  const pathName = moduleName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
  return `/${subdomain}/${pathName}`;
};

const formatLabel = (moduleName: string): string => {
  let formatted = moduleName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
  formatted = formatted.replace(/And/g, '&');
  formatted = formatted.replace(/Permissions/g, 'Permissions');
  return formatted;
};

const menuOrder = [
  'Dashboard',
  'Leads',
  'Customer',
  'User',
  'Utilities',
  'Settings',
  'RolesandPermissions',
  'Integration'
];

const Sidebar = ({ onHoverChange }: SidebarProps) => {
  const [, setPermissions] = useState<Permission[]>([]);
  const [menuItems, setMenuItems] = useState<DynamicMenuItem[]>([]);
  const [bottomItems, setBottomItems] = useState<DynamicMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const subdomain = localStorage.getItem("subdomain") || "default";

  useEffect(() => {
    if (onHoverChange) {
      onHoverChange(isHovered);
    }
  }, [isHovered, onHoverChange]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await meAPI();
        let permissionsArray: Permission[] = [];
        
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

  if (loading) {
    return (
      <aside className="bg-gradient-to-b from-[#0d1954] to-[#0a1240] text-gray-300 w-20 flex flex-col shadow-2xl">
        <div className="flex items-center justify-center h-full">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </aside>
    );
  }

  if (error || (menuItems.length === 0 && bottomItems.length === 0)) {
    return null;
  }

  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "5rem" },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const tooltipVariants = {
    hidden: { opacity: 0, x: -10, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1 },
  };

  return (
    <motion.aside
      initial="collapsed"
      animate={isHovered ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative bg-gradient-to-b from-[#0d1954] to-[#0a1240] text-gray-300 flex flex-col shadow-2xl z-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Spacer to account for navbar logo (no logo in sidebar anymore) */}
      <div className="h-4"></div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="px-3 space-y-1">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial="hidden"
              animate="visible"
              variants={menuItemVariants}
              transition={{ delay: index * 0.05 }}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                      : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 w-1 h-8 bg-blue-400 rounded-r-full"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    
                    <motion.span
                      className="whitespace-nowrap text-sm font-medium"
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        display: isHovered ? "inline-block" : "none",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  </>
                )}
              </NavLink>

              {!isHovered && hoveredItem === item.label && (
                <motion.div
                  variants={tooltipVariants}
                  initial="hidden"
                  animate="visible"
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50"
                >
                  <div className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-1 h-0 border-t-4 border-r-4 border-b-4 border-transparent border-r-gray-900" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </nav>

      {/* Bottom Navigation */}
      {bottomItems.length > 0 && (
        <div className="border-t border-gray-700/50 pt-4 pb-6 px-3">
          <div className="space-y-1">
            {bottomItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial="hidden"
                animate="visible"
                variants={menuItemVariants}
                transition={{ delay: (menuItems.length + index) * 0.05 }}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                        : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicatorBottom"
                          className="absolute left-0 w-1 h-8 bg-blue-400 rounded-r-full"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                      
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      
                      <motion.span
                        className="whitespace-nowrap text-sm font-medium"
                        animate={{
                          opacity: isHovered ? 1 : 0,
                          display: isHovered ? "inline-block" : "none",
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    </>
                  )}
                </NavLink>

                {!isHovered && hoveredItem === item.label && (
                  <motion.div
                    variants={tooltipVariants}
                    initial="hidden"
                    animate="visible"
                    className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50"
                  >
                    <div className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                      {item.label}
                      <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-1 h-0 border-t-4 border-r-4 border-b-4 border-transparent border-r-gray-900" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}

            {/* Logout Button */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={menuItemVariants}
              transition={{ delay: (menuItems.length + bottomItems.length) * 0.05 }}
              className="relative"
              onMouseEnter={() => setHoveredItem("Logout")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                onClick={handleLogout}
                className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-200 cursor-pointer group"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                
                <motion.span
                  className="whitespace-nowrap text-sm font-medium"
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    display: isHovered ? "inline-block" : "none",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  Logout
                </motion.span>
              </button>

              {!isHovered && hoveredItem === "Logout" && (
                <motion.div
                  variants={tooltipVariants}
                  initial="hidden"
                  animate="visible"
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50"
                >
                  <div className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                    Logout
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-1 h-0 border-t-4 border-r-4 border-b-4 border-transparent border-r-red-600" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Version Info */}
      <motion.div
        className="text-center pb-4"
        animate={{ opacity: isHovered ? 0.5 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {isHovered && (
          <p className="text-xs text-gray-500">Version 1.0.0</p>
        )}
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;