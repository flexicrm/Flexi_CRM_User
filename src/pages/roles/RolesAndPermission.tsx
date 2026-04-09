import { motion } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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

const RolesAndPermission = () => {
  const [permissionss, setPermissions] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { permissions } = useSelector((state: any) => state.auth);
  const Roles = permissions?.[5];
  const navigate = useNavigate();

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
        <span className="text-xs font-medium text-slate-600">
          {val + 1}
        </span>
      ),
    },
    {
      title: "Group",
      dataIndex: "Group",
      key: "Group",
      render: (val: string) => (
        <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
          {val || "-"}
        </span>
      ),
    },
    {
      title: "User Role",
      dataIndex: "userRole",
      key: "userRole",
      render: (val: string) => (
        <span className="text-xs text-slate-700 font-semibold">
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

      // Add index (0, 1, 2...) into every row
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
      className="min-h-screen bg-[#F8FAFC] py-6 px-4 md:py-8 md:px-6 lg:px-8"
    >
      <div className="w-full mx-auto space-y-6">
        
        {/* --- LAYER 1: HERO HEADER --- */}
        <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
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
              >
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.07.08A10 10 0 0 0 12 17.66a10 10 0 0 0 6.33-2.58l.07-.08Z" />
                <path d="M5.78 9a1.65 1.65 0 0 1-.33-1.82A1.65 1.65 0 0 1 6.96 6h10.08a1.65 1.65 0 0 1 1.51 1 1.65 1.65 0 0 1-.33 1.82l-.07.08A10 10 0 0 1 12 12.34a10 10 0 0 1-6.33-2.58l-.07-.08Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Roles & Permissions</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs md:text-sm text-slate-500">Manage user roles and their access permissions</p>
                <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
                <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block">
                  {filteredData.length} Total
                </p>
              </div>
            </div>
          </div>

          <Tooltip text="Add New Role">
            <Reusable_Button
              text="Add Role"
              onClick={handleCreate}
              icon={<Plus size={16} />}
              disabled={!Roles?.canCreate}
              size="px-4 py-2 text-sm font-medium rounded-lg shadow-md shadow-indigo-200/50"
            />
          </Tooltip>
        </motion.header>

        {/* --- LAYER 2: UNIFIED DATA CARD --- */}
        <motion.main variants={itemVariants} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
          
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search by role or group..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="p-0 sm:p-4">
            {filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
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
                    className="text-slate-400"
                  >
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.07.08A10 10 0 0 0 12 17.66a10 10 0 0 0 6.33-2.58l.07-.08Z" />
                    <path d="M5.78 9a1.65 1.65 0 0 1-.33-1.82A1.65 1.65 0 0 1 6.96 6h10.08a1.65 1.65 0 0 1 1.51 1 1.65 1.65 0 0 1-.33 1.82l-.07.08A10 10 0 0 1 12 12.34a10 10 0 0 1-6.33-2.58l-.07-.08Z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">No Roles Found</h3>
                <p className="text-xs text-slate-500">
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
              />
            )}
          </div>
        </motion.main>
      </div>
    </motion.div>
  );
};

export default RolesAndPermission;