import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ShieldAlert } from "lucide-react";
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
  const Roles = permissions[5];
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

      const formatted = formatPermissions(apiData?.permissions);
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
          
          // Navigate back after successful deletion
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
    <motion.div className="p-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          disabled={deleting}
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Role Details: {getPermission?.userRole || "N/A"}
          </h1>
          {getPermission?.Group && (
            <p className="text-sm text-slate-500 mt-1">
              Group: {getPermission.Group}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {permissionss.length > 0 ? (
           <Overall_Permissions
            permissionss={permissionss}
            setPermissions={setPermissions}
            customizeButtom={true}
            editOnclick={handleEdit}
            deleteOnclick={handleDelete}
          />
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-slate-200">
            <ShieldAlert size={40} className="mx-auto mb-4 text-gray-400" />
            <p className="text-slate-500">No permissions found for this role</p>
          </div>
        )}
      </AnimatePresence>

      {/* Loading overlay for delete operation */}
      {deleting && <RippleLoader />}
    </motion.div>
  );
};

export default Roles_And_Permissions;