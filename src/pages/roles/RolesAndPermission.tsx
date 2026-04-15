import { motion } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// --- DRIVER.JS IMPORTS ---
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import Reusable_Button from "../../component/button/Reusable_Button";
import RippleLoader from "../../component/Loader/RippleLoader";
import Table, { type Column } from "../../component/table/Table";
import { Permissions_getall } from "../../store/homepage_slice/Permissions_Slice";

type RoleItem = {
  Group: string;
  userRole: string;
  permissions: any[];
  _id: string;
  index?: number;
};

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

const RolesAndPermission = () => {
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);
  const [permissionss, setPermissions] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { permissions } = useSelector((state: any) => state.auth);
  const Roles = permissions?.[5];
  const navigate = useNavigate();

  // Theme-based styles
  const getPageBg = () => darkMode ? 'bg-gray-900' : 'bg-[#F8FAFC]';
  const getCardBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getCardBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200/60';
  const getHeaderIconBg = () => darkMode ? 'bg-gray-700' : 'bg-indigo-100';
  const getHeaderIconColor = () => darkMode ? primaryColor || '#818CF8' : '#6366f1';
  const getTitleColor = () => darkMode ? 'text-white' : 'text-slate-900';
  const getSubtitleColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';
  const getSeparatorColor = () => darkMode ? 'bg-gray-600' : 'bg-slate-300';
  const getCountColor = () => darkMode ? 'text-gray-500' : 'text-slate-500';
  const getSearchInputBg = () => darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-slate-200';
  const getSearchIconColor = () => darkMode ? 'text-gray-500' : 'text-slate-400';
  const getClearButtonColor = () => darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600';
  const getEmptyStateIconBg = () => darkMode ? 'bg-gray-700' : 'bg-slate-100';
  const getEmptyStateIconColor = () => darkMode ? 'text-gray-500' : 'text-slate-400';
  const getEmptyStateTitleColor = () => darkMode ? 'text-gray-200' : 'text-slate-800';
  const getEmptyStateTextColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';

  const handleCreate = () => {
    navigate(`/${localStorage.getItem("subdomain")}/rolesand-permissions/create-role`);
  };

  const columns: Column[] = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      width: "70px",
      render: (val: number) => (
        <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
          {val + 1}
        </span>
      ),
    },
    {
      title: "Group",
      dataIndex: "Group",
      key: "Group",
      render: (val: string) => (
        <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
          {val || "-"}
        </span>
      ),
    },
    {
      title: "User Role",
      dataIndex: "userRole",
      key: "userRole",
      render: (val: string) => (
        <span className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
          {val || "-"}
        </span>
      ),
    },
  ];

  // Fetch data
  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await Permissions_getall();
      const apiData = response?.data?.data || [];

      const updatedData = apiData.map((item: RoleItem, index: number) => ({
        ...item,
        index,
      }));

      setPermissions(updatedData);
    } catch (error: any) {
      console.error("Error fetching permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // --- DRIVER.JS TOUR LOGIC ---
  useEffect(() => {
    // Only trigger tour after loading is completely finished
    if (loading) return;

    let driverObj: any = null;

    const timer = setTimeout(() => {
      // Phase 1: No roles exist yet
      if (permissionss.length === 0 && !localStorage.getItem("role_tour_create")) {
        driverObj = driver({
          showProgress: false,
          animate: true,
          popoverClass: darkMode ? 'driver-dark-theme' : '',
          steps: [
            {
              element: '.tour-add-role-btn',
              popover: {
                title: '🔐 Create a Role',
                description: 'You have no roles set up yet. Click here to create your first role and define its permissions.',
                side: "bottom",
                align: 'end'
              }
            }
          ],
          onDestroyStarted: () => {
            localStorage.setItem("role_tour_create", "true");
            driverObj.destroy();
          }
        });
        driverObj.drive();
      } 
      // Phase 2: Roles exist -> Show how to edit/delete
      else if (permissionss.length > 0 && !localStorage.getItem("role_tour_actions")) {
        driverObj = driver({
          showProgress: false,
          animate: true,
          popoverClass: darkMode ? 'driver-dark-theme' : '',
          steps: [
            {
              element: '.tour-action-area',
              popover: {
                title: '⚙️ Manage Roles',
                description: 'Great! You have roles created. Use the action menu on the right side of any row to view, edit, or delete a role.',
                side: "left",
                align: 'start'
              }
            }
          ],
          onDestroyStarted: () => {
            localStorage.setItem("role_tour_actions", "true");
            driverObj.destroy();
          }
        });
        driverObj.drive();
      }
    }, 800);

    return () => {
      clearTimeout(timer);
      if (driverObj) driverObj.destroy();
    };
  }, [permissionss.length, loading, darkMode]);

  // Inject Custom Dark Mode Styles for Driver.js
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .driver-dark-theme .driver-popover {
        background-color: #1f2937 !important;
        color: #f3f4f6 !important;
      }
      .driver-dark-theme .driver-popover-title {
        color: #f3f4f6 !important;
      }
      .driver-dark-theme .driver-popover-description {
        color: #9ca3af !important;
      }
      .driver-dark-theme .driver-popover-arrow {
        border-color: #1f2937 !important;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Filter data based on search term
  const filteredData = permissionss.filter(item =>
    item.userRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.Group?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  if (loading) {
    return <RippleLoader />;
  }

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
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="md:w-6 md:h-6"
                style={{ color: getHeaderIconColor() }}
              >
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.07.08A10 10 0 0 0 12 17.66a10 10 0 0 0 6.33-2.58l.07-.08Z" />
                <path d="M5.78 9a1.65 1.65 0 0 1-.33-1.82A1.65 1.65 0 0 1 6.96 6h10.08a1.65 1.65 0 0 1 1.51 1 1.65 1.65 0 0 1-.33 1.82l-.07.08A10 10 0 0 1 12 12.34a10 10 0 0 1-6.33-2.58l-.07-.08Z" />
              </svg>
            </div>
            <div>
              <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold tracking-tight ${getTitleColor()}`}>Roles & Permissions</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className={`text-xs md:text-sm ${getSubtitleColor()}`}>Manage user roles and their access permissions</p>
                <span className={`w-1 h-1 rounded-full hidden sm:block ${getSeparatorColor()}`}></span>
                <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider hidden sm:block ${getCountColor()}`}>
                  {filteredData.length} Total
                </p>
              </div>
            </div>
          </div>

          {/* Added .tour-add-role-btn wrapper for Phase 1 Target */}
          <div className="tour-add-role-btn">
            <Tooltip text="Add New Role">
              <Reusable_Button
                text="Add Role"
                onClick={handleCreate}
                icon={<Plus size={16} />}
                disabled={!Roles?.canCreate}
                size="px-4 py-2 text-sm font-medium rounded-lg"
              />
            </Tooltip>
          </div>
        </motion.header>

        {/* --- LAYER 2: UNIFIED DATA CARD --- */}
        <motion.main variants={itemVariants} className={`rounded-xl md:rounded-2xl shadow-sm border overflow-hidden flex flex-col ${getCardBg()} ${getCardBorder()}`}>
          
          {/* Search Bar */}
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-slate-100'}`}>
            <div className="relative max-w-sm">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${getSearchIconColor()}`} size={14} />
              <input
                type="text"
                placeholder="Search by role or group..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full pl-9 pr-8 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 transition-all ${getSearchInputBg()}`}
                style={
                  {
                    '--tw-ring-color': `${primaryColor}20`
                  } as React.CSSProperties
                }
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 ${getClearButtonColor()}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="p-0 sm:p-0">
            {filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${getEmptyStateIconBg()}`}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="32" 
                    height="32" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className={getEmptyStateIconColor()}
                  >
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.07.08A10 10 0 0 0 12 17.66a10 10 0 0 0 6.33-2.58l.07-.08Z" />
                    <path d="M5.78 9a1.65 1.65 0 0 1-.33-1.82A1.65 1.65 0 0 1 6.96 6h10.08a1.65 1.65 0 0 1 1.51 1 1.65 1.65 0 0 1-.33 1.82l-.07.08A10 10 0 0 1 12 12.34a10 10 0 0 1-6.33-2.58l-.07-.08Z" />
                  </svg>
                </div>
                <h3 className={`text-base font-semibold mb-1 ${getEmptyStateTitleColor()}`}>No Roles Found</h3>
                <p className={`text-xs ${getEmptyStateTextColor()}`}>
                  {searchTerm ? "No roles match your search criteria." : "No roles have been created yet."}
                </p>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="mt-3 text-indigo-600 hover:text-indigo-700 text-xs font-medium"
                  >
                    Clear search
                  </button>
                )}
                {!searchTerm && Roles?.canCreate && (
                  <Reusable_Button
                    text="Create First Role"
                    onClick={handleCreate}
                    icon={<Plus size={14} />}
                    variant="primary"
                    size="px-4 py-2 text-sm mt-4"
                  />
                )}
              </div>
            ) : (
              // Added .tour-action-area wrapper for Phase 2 Target
              <div className="tour-action-area">
                <Table
                  columns={columns}
                  data={filteredData}
                  showSelection={false}
                  enableSearch={false}
                  actionButtons={{
                    showView: !!Roles?.canRead,
                    onView: (record: RoleItem) => {
                      if (!Roles?.canRead) return;
                      const subdomain = localStorage.getItem("subdomain") || "default";
                      navigate(`/${subdomain}/rolesand-permissions/view`, {
                        state: {
                          tableId: record.index,
                        },
                      });
                    },
                  }}
                  pagination={{
                    currentPage,
                    itemsPerPage,
                    totalItems: filteredData.length,
                    onPageChange: setCurrentPage,
                    onItemsPerPageChange: (size: number) => {
                      setItemsPerPage(size);
                      setCurrentPage(1);
                    },
                  }}
                  rowClickable={!!Roles?.canRead}
                  theme={{ darkMode, primaryColor }}
                />
              </div>
            )}
          </div>
        </motion.main>
      </div>
    </motion.div>
  );
};

export default RolesAndPermission;