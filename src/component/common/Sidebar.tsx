import { motion } from "framer-motion";
import {
  BarChart,
  Bell,
  Box,
  Calendar,
  ChevronLeft,
  ChevronRight,
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

// Comprehensive icon mapping for all possible modules (NO DUPLICATES)
const iconMap: Record<string, React.ElementType> = {
  // Core CRM Modules
  Dashboard: LayoutDashboard,
  DashboardNew: LayoutDashboard,
  Home: Home,
  
  // Customer Related
  Customer: Users,
  Customers: Users,
  Client: Users,
  Clients: Users,
  Account: User,
  Accounts: Users,
  Contact: User,
  Contacts: Users,
  
  // User Related
  User: UserRoundCog,
  Users: UserRoundCog,
  Employee: User,
  Employees: Users,
  Staff: Users,
  Team: Users,
  
  // Sales Related
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
  
  // Marketing
  Campaign: Send,
  Campaigns: Send,
  Marketing: TrendingUp,
  Email: Mail,
  EmailMarketing: Mail,
  SMS: MessageSquare,
  PushNotification: Bell,
  Newsletter: FileText,
  
  // Support
  Support: HelpCircle,
  Ticket: Tag,
  Tickets: Tag,
  Complaint: Flag,
  Feedback: ThumbsUp,
  Review: StarIcon,
  
  // Product/Inventory
  Product: Package,
  Products: Package,
  Inventory: Box,
  Stock: Package,
  Warehouse: Truck,
  Supplier: Truck,
  Vendors: Truck,
  
  // Finance
  Finance: DollarSign,
  Accounting: DollarSign,
  Payment: DollarSign,
  Payments: DollarSign,
  Expense: DollarSign,
  Expenses: DollarSign,
  Budget: DollarSign,
  Analytics: BarChart,  // Single definition
  AnalyticsReport: BarChart, // Alternative name
  ReportAnalytics: BarChart, // Alternative name
  
  // HR
  HR: Users,
  HumanResources: Users,
  Attendance: Calendar,
  Leave: Calendar,
  Payroll: DollarSign,
  Recruitment: UserPlus,
  Training: Monitor,
  Performance: TrendingUp,
  
  // Project Management
  Project: Folder,
  Projects: Folder,
  Task: TrendingUp,
  Tasks: TrendingUp,
  Milestone: Flag,
  Timeline: Calendar,
  
  // Settings & Admin
  Settings: Settings,
  Setup: Settings,
  Configuration: Sliders,
  Preference: Sliders,
  RolesandPermissions: Shield,
  Roles: Shield,
  Permissions: Shield,
  Security: ShieldIcon,
  
  // Utilities
  Utilities: Wrench,
  Tools: TrendingUp,
  Integration: Link,
  API: Key,
  Webhook: Repeat,
  
  // Communication
  Communication: MessageSquare,
  Chat: MessageSquare,
  Message: Mail,
  Notification: Bell,
  Alert: Bell,
  
  // Documents
  Document: FileText,
  Documents: FileText,
  File: Paperclip,
  Files: Paperclip,
  Template: Copy,
  
  // Calendar/Schedule
  Calendar: Calendar,
  Schedule: Calendar,
  Event: Calendar,
  Meeting: Video,
  
  // Reports & Stats (combined, no duplicates)
  Reports: BarChart,
  Statistics: PieChart,
  Stats: BarChart,
  ReportData: BarChart,
  ReportSummary: BarChart,
  
  // System
  System: Monitor,
  Database: Grid,
  Backup: Save,
  Log: List,
  Audit: Search,
  
  // Default
  Default: Folder,
};

// Helper function to get icon for module
const getIconForModule = (moduleName: string): React.ElementType => {
  // Try exact match
  if (iconMap[moduleName]) {
    return iconMap[moduleName];
  }
  
  // Try case-insensitive match
  const lowerModule = moduleName.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (key.toLowerCase() === lowerModule) {
      return icon;
    }
  }
  
  // Return default icon
  return Folder;
};

// Helper function to generate path from module name
const generatePath = (moduleName: string, subdomain: string): string => {
  // Convert CamelCase or PascalCase to kebab-case
  const pathName = moduleName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
  
  return `/${subdomain}/${pathName}`;
};

// Helper function to format label for display
const formatLabel = (moduleName: string): string => {
  // Add spaces before capital letters and handle special cases
  let formatted = moduleName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
  
  // Handle special cases
  formatted = formatted.replace(/And/g, '&');
  formatted = formatted.replace(/Permissions/g, 'Permissions');
  
  return formatted;
};

// Sort order for menu items
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

const Sidebar = () => {
  const [, setPermissions] = useState<Permission[]>([]);
  const [menuItems, setMenuItems] = useState<DynamicMenuItem[]>([]);
  const [bottomItems, setBottomItems] = useState<DynamicMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const subdomain = localStorage.getItem("subdomain") || "default";

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await meAPI();
        console.log("API Response:", response);
        
        // Extract permissions array from response
        let permissionsArray: Permission[] = [];
        
        if (response.data?.data?.permissions && Array.isArray(response.data.data.permissions)) {
          permissionsArray = response.data.data.permissions;
        } else if (response.data?.permissions && Array.isArray(response.data.permissions)) {
          permissionsArray = response.data.permissions;
        } else if (Array.isArray(response.data)) {
          permissionsArray = response.data;
        }
        
        console.log("Permissions Array:", permissionsArray);
        setPermissions(permissionsArray);
        
        // Generate menu items dynamically from permissions
        const allMenuItems: DynamicMenuItem[] = [];
        const bottomMenuItems: DynamicMenuItem[] = [];
        
        permissionsArray.forEach((perm) => {
          // Only show modules with canRead permission
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
            
            // Separate Settings and Roles to bottom
            if (perm.module === 'Settings' || perm.module === 'RolesandPermissions') {
              bottomMenuItems.push(menuItem);
            } else {
              allMenuItems.push(menuItem);
            }
          }
        });
        
        // Sort menu items based on predefined order
        const sortedMenuItems = [...allMenuItems].sort((a, b) => {
          const indexA = menuOrder.indexOf(a.module);
          const indexB = menuOrder.indexOf(b.module);
          
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.label.localeCompare(b.label);
        });
        
        // Sort bottom items
        const sortedBottomItems = [...bottomMenuItems].sort((a, b) => {
          const order = ['Settings', 'RolesandPermissions'];
          const indexA = order.indexOf(a.module);
          const indexB = order.indexOf(b.module);
          return indexA - indexB;
        });
        
        setMenuItems(sortedMenuItems);
        setBottomItems(sortedBottomItems);
        
        console.log("Generated Menu Items:", sortedMenuItems);
        console.log("Generated Bottom Items:", sortedBottomItems);
        
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
    // Clear all auth-related storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("userData");
    localStorage.removeItem("authResponse");
    localStorage.removeItem("subdomain");
    localStorage.removeItem("isFirstLogin");
    localStorage.removeItem("mobile");
    localStorage.removeItem("token");
    
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Loading state with animation
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

  // Don't show sidebar if there's an error or no menu items
  if (error || (menuItems.length === 0 && bottomItems.length === 0)) {
    return null;
  }

  // Animation variants
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
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative bg-gradient-to-b from-[#0d1954] to-[#0a1240] text-gray-300 flex flex-col shadow-2xl z-20"
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-[#0d1954] rounded-full p-1 border border-gray-700 shadow-lg hover:bg-blue-600 transition-all duration-200 z-30"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-white" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-white" />
        )}
      </button>

      {/* Logo Section */}
      <div className="flex items-center justify-center py-6 border-b border-gray-700/50">
        <motion.div whileHover={{ scale: 1.05 }} className="relative">
          {!isCollapsed ? (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              FlexiCRM
            </motion.h1>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-sm">F</span>
            </motion.div>
          )}
        </motion.div>
      </div>

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
                    {/* Active Indicator */}
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
                        opacity: isCollapsed ? 0 : 1,
                        display: isCollapsed ? "none" : "inline-block",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  </>
                )}
              </NavLink>

              {/* Tooltip for collapsed mode */}
              {isCollapsed && hoveredItem === item.label && (
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
                          opacity: isCollapsed ? 0 : 1,
                          display: isCollapsed ? "none" : "inline-block",
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    </>
                  )}
                </NavLink>

                {/* Tooltip for collapsed mode */}
                {isCollapsed && hoveredItem === item.label && (
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
                    opacity: isCollapsed ? 0 : 1,
                    display: isCollapsed ? "none" : "inline-block",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  Logout
                </motion.span>
              </button>

              {/* Tooltip for collapsed mode */}
              {isCollapsed && hoveredItem === "Logout" && (
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
        animate={{ opacity: isCollapsed ? 0 : 0.5 }}
        transition={{ duration: 0.2 }}
      >
        {!isCollapsed && (
          <p className="text-xs text-gray-500">Version 1.0.0</p>
        )}
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;