import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Edit, Shield, ShieldAlert, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import RippleLoader from "../../component/Loader/RippleLoader";
import {
  confirmAlert,
  errorAlert,
  successAlert,
  warningAlert,
} from "../../component/Notification/statusHandler";
import Reusable_Button from "../../component/button/Reusable_Button";
import Overall_Permissions from "../../component/permissions/Overall_Permissions";
import {
  Create_Permissions_Delete,
  Permissions_getall,
} from "../../store/homepage_slice/Permissions_Slice";

type PermissionItem = {
  module: string;
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
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

// Helper function to extract error message
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Error occurred while loading role permissions. Please try again.";
  
  if (error?.response?.data) {
    const responseData = error.response.data;
    
    if (responseData.message) {
      errorMessage = responseData.message;
    } else if (responseData.errors) {
      if (typeof responseData.errors === 'string') {
        errorMessage = responseData.errors;
      } else if (typeof responseData.errors === 'object') {
        const firstErrorKey = Object.keys(responseData.errors)[0];
        if (firstErrorKey && responseData.errors[firstErrorKey]) {
          errorMessage = Array.isArray(responseData.errors[firstErrorKey]) 
            ? responseData.errors[firstErrorKey][0] 
            : responseData.errors[firstErrorKey];
        } else {
          errorMessage = JSON.stringify(responseData.errors);
        }
      }
    } else if (responseData.error) {
      errorMessage = responseData.error;
    }
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  if (errorMessage.toLowerCase().includes('network')) {
    errorMessage = "Network error. Please check your internet connection.";
  }
  
  return errorMessage;
};

const formatPermissions = (permissionsArray: any[]): PermissionItem[] => {
  if (!Array.isArray(permissionsArray)) return [];
  
  return permissionsArray.map((perm) => ({
    module: perm.module,
    create: !!perm.canCreate,
    view: !!perm.canRead,
    edit: !!perm.canEdit,
    delete: !!perm.canDelete,
  }));
};

const Roles_And_Permissions: React.FC = () => {
  const navigate = useNavigate();

  const [getPermission, setGetPermission] = useState<any>(null);
  const [permissionss, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  const { permissions } = useSelector((state: any) => state.auth);
  const Roles = permissions?.[5] || {};
  const location = useLocation();
  const { tableId } = location.state || {};

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await Permissions_getall();
      const apiData = response?.data?.data?.[tableId] || {};

      if (!apiData || Object.keys(apiData).length === 0) {
        warningAlert("Role not found", "Okay");
        navigate(-1);
        return;
      }

      const formatted = formatPermissions(apiData?.permissions || []);
      setPermissions(formatted);
      setGetPermission(apiData);
    } catch (error: any) {
      console.error(error);
      const errorMessage = extractErrorMessage(error);
      errorAlert(errorMessage, "Retry", "Load Failed");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [tableId]);

  const handleDelete = () => {
    if (!getPermission?._id) {
      errorAlert("No permission ID found", "Okay");
      return;
    }

    if (!Roles?.canDelete) {
      warningAlert("You don't have permission to delete roles", "Okay");
      return;
    }

    confirmAlert({
      title: "Delete Role",
      message: `Are you sure you want to delete "${getPermission.userRole}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          setDeleting(true);
          const res = await Create_Permissions_Delete(getPermission._id);
          const successMsg = res?.data?.message || "Role deleted successfully!";
          successAlert(successMsg, "Done", "Deleted");
          
          setTimeout(() => {
            navigate(-1);
          }, 1500);
        } catch (err: any) {
          const errorMessage = extractErrorMessage(err);
          errorAlert(errorMessage, "Try Again", "Delete Failed");
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const handleEdit = () => {
    if (!Roles?.canEdit) {
      warningAlert("You don't have permission to edit roles", "Okay");
      return;
    }
    
    navigate(`/${localStorage.getItem("subdomain")}/rolesand-permissions/create-role`, {
      state: {
        edit: true,
        rolesData: getPermission,
        permissionId: getPermission?._id,
      },
    });
  };

  const handleBack = () => {
    navigate(-1);
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
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              disabled={deleting}
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
              <Shield size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                {getPermission?.userRole || "Role Details"}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {getPermission?.Group && (
                  <>
                    <p className="text-xs md:text-sm text-slate-500">
                      Group: <span className="font-semibold text-slate-700">{getPermission.Group}</span>
                    </p>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  </>
                )}
                <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {permissionss.length} Permission{permissionss.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {Roles?.canEdit && (
              <Tooltip text="Edit Role">
                <Reusable_Button
                  text="Edit Role"
                  onClick={handleEdit}
                  icon={<Edit size={16} />}
                  variant="secondary"
                  size="px-4 py-2 text-sm font-medium rounded-lg"
                />
              </Tooltip>
            )}
            
            {Roles?.canDelete && (
              <Tooltip text="Delete Role">
                <Reusable_Button
                  text="Delete"
                  onClick={handleDelete}
                  icon={<Trash2 size={16} />}
                  variant="danger"
                  size="px-4 py-2 text-sm font-medium rounded-lg"
                  disabled={deleting}
                />
              </Tooltip>
            )}
          </div>
        </motion.header>

        {/* --- LAYER 2: UNIFIED DATA CARD --- */}
        <motion.main variants={itemVariants} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          
          {/* Content */}
          <AnimatePresence mode="wait">
            {permissionss.length > 0 ? (
              <motion.div
                key="permissions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-4 md:p-6"
              >
                <Overall_Permissions
                  permissionss={permissionss}
                  setPermissions={setPermissions}
                  customizeButtom={false}
                  editOnclick={handleEdit}
                  deleteOnclick={handleDelete}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                  <ShieldAlert size={40} className="text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Permissions Found</h3>
                <p className="text-sm text-slate-500 max-w-md">
                  This role doesn't have any permissions configured yet.
                </p>
                {Roles?.canEdit && (
                  <Reusable_Button
                    text="Configure Permissions"
                    onClick={handleEdit}
                    icon={<Shield size={16} />}
                    variant="primary"
                    size="px-5 py-2.5 text-sm mt-6 rounded-lg"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>

      {/* Loading overlay for delete operation */}
      {(deleting) && <RippleLoader />}
    </motion.div>
  );
};

export default Roles_And_Permissions;