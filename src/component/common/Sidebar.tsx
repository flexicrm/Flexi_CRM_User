// components/common/Sidebar.tsx
import {
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Star,
  UserRoundCog,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { meAPI } from "../../store/Login_Slice";

interface MenuItem {
  path: string;
  icon: React.ElementType;
  label: string;
  permission: string;
}

interface Permission {
  canCreate?: boolean;
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

interface PermissionsData {
  [key: string]: Permission;
}

const Sidebar = () => {
  const [meData, setMeData] = useState<PermissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const localstorageData = localStorage.getItem("subdomain") || "default";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await meAPI();
        
        // Extract permissions from response
        const permissions = response.data?.data?.permissions || response.data?.permissions || {};
        setMeData(permissions);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Failed to load user permissions");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Show nothing while loading or if API not called successfully
  if (loading) {
    return (
      <aside className="group bg-[#0d1954] text-gray-300 w-20 hover:w-64 transition-all duration-300 ease-in-out overflow-hidden flex flex-col shadow-xl">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </aside>
    );
  }

    // ✅ LOGOUT FUNCTION
  const handleLogout = () => {
    // 🔥 Clear all auth-related storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("userData");
    localStorage.removeItem("authResponse");
    localStorage.removeItem("subdomain");
    localStorage.removeItem("isFirstLogin");

    // Optional: clear everything
    // localStorage.clear();

    // ✅ Redirect
    navigate("/login");
  };

  // Don't show sidebar if there's an error or no permissions data
  if (error || !meData) {
    return null;
  }

  const permissionsData = meData;

  // Menu items with permission keys
  const menuItems: MenuItem[] = [
    { path: `/${localstorageData}/dashboard`, icon: LayoutDashboard, label: "Dashboard", permission: "Dashboard" },
    { path: `/${localstorageData}/customers`, icon: Users, label: "Customers", permission: "Customer" },
    { path: `/${localstorageData}/all-users`, icon: UserRoundCog, label: "All Users", permission: "User" },
    { path: `/${localstorageData}/leads`, icon: Star, label: "Leads", permission: "Leads" },
    { path: `/${localstorageData}/Utilities`, icon: Wrench, label: "Utilities", permission: "Utilities" },
  ];

  //  Filter menu items based on canRead permission
  const filteredMenuItems = menuItems.filter(
    (item) => permissionsData[item.permission]?.canRead === true
  );

  //  Bottom menu items
  const bottomItems: MenuItem[] = [
    { path: `/${localstorageData}/settings`, icon: Settings, label: "Settings", permission: "Setup" },
    { path: `/${localstorageData}/roles`, icon: Shield, label: "Roles & Permissions", permission: "RolesPermissions" },
  ];

  //  Filter bottom items based on canRead permission
  const filteredBottomItems = bottomItems.filter(
    (item) => permissionsData[item.permission]?.canRead === true
  );

  // Don't render sidebar if no menu items are visible
  if (filteredMenuItems.length === 0 && filteredBottomItems.length === 0) {
    return null;
  }


  return (
    <aside className="group bg-[#0d1954] text-gray-300 w-20 hover:w-64 transition-all duration-300 ease-in-out overflow-hidden flex flex-col shadow-xl">
      {/* Main Navigation */}
      <nav className="flex-1">
        <div className="px-3 space-y-1 mt-6">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group/item ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Navigation */}
      {filteredBottomItems.length > 0 && (
        <div className="border-t border-gray-700 pt-4 pb-6 px-3">
          <div className="space-y-1">
            {filteredBottomItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group/item ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {item.label}
                </span>
              </NavLink>
            ))}

             {/*  LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="opacity-0 group-hover:opacity-100 transition">
            Logout
          </span>
        </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;