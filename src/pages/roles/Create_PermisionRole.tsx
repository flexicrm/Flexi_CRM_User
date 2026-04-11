import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Reusable_Button from "../../component/button/Reusable_Button";
import RippleLoader from "../../component/Loader/RippleLoader";
import {
  confirmAlert,
  errorAlert,
  successAlert,
  warningAlert,
} from "../../component/Notification/statusHandler";
import Overall_Permissions from "../../component/permissions/Overall_Permissions";
import {
  Create_Permissions_Create,
  Create_Permissions_Edit,
} from "../../store/homepage_slice/Permissions_Slice";
import { fetchMeData } from "../../store/Login_Slice";

type PermissionItem = {
  module: string;
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
};

type ApiPermission = {
  module: string;
  canCreate?: boolean;
  canRead?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

type ApiPayload = {
  userRole: string;
  Group?: string;
  permissions: ApiPermission[];
};

interface ValidationErrors {
  userRole?: string;
}

const fallbackModules: string[] = [
  "Dashboard",
  "Leads",
  "Customer",
  "User",
  "Utilities",
  "Settings",
  "RolesandPermissions",
  "Integration"
];

// Helper function to extract error message
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Error occurred while saving role. Please try again.";
  
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
  
  if (errorMessage.toLowerCase().includes('duplicate')) {
    errorMessage = "A role with this name already exists. Please use a different name.";
  }
  if (errorMessage.toLowerCase().includes('validation')) {
    errorMessage = "Please check all required fields and try again.";
  }
  if (errorMessage.toLowerCase().includes('network')) {
    errorMessage = "Network error. Please check your internet connection.";
  }
  
  return errorMessage;
};

const Create_PermisionRole = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {  darkMode } = useSelector((state: any) => state.theme);
  const { edit, rolesData, permissionId } = location.state || {};
  
  const { meData, meLoading } = useSelector((state: any) => state.auth);

  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [userRole, setUserRole] = useState("");
  const [group, setGroup] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Theme-based styles
  const getCardBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getCardBorder = () => darkMode ? 'border-gray-700' : 'border-gray-200';
  const getTitleColor = () => darkMode ? 'text-white' : 'text-slate-900';
  const getSubtitleColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';
  const getBackButtonBg = () => darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100';
  const getBackButtonColor = () => darkMode ? 'text-gray-400' : 'text-slate-600';
  const getModuleCountBg = () => darkMode ? 'bg-gray-700 text-gray-300' : 'bg-slate-100 text-slate-500';
  const getLabelColor = () => darkMode ? 'text-gray-300' : 'text-slate-700';
  const getInputBg = () => darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300';
  const getInputFocusRing = () => darkMode ? 'focus:ring-indigo-500' : 'focus:ring-indigo-500';
  const getHelperTextColor = () => darkMode ? 'text-gray-500' : 'text-slate-400';
  const getPermissionsHeaderBg = () => darkMode ? 'bg-gray-700/50' : 'bg-slate-50';
  const getPermissionsHeaderBorder = () => darkMode ? 'border-gray-700' : 'border-gray-200';
  const getPermissionsHeaderTitleColor = () => darkMode ? 'text-gray-200' : 'text-slate-700';
  const getPermissionsHeaderSubColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';
  const getPermissionsContentBg = () => darkMode ? 'bg-gray-800' : 'bg-white';

  const fetchModules = async () => {
    try {
      setLoading(true);
      
      if (meData?.permissions && Array.isArray(meData.permissions)) {
        const modules = meData.permissions.map((p: any) => p.module);
        setAvailableModules(modules);
        initializePermissions(modules);
      } else {
        const result = await dispatch(fetchMeData() as any);
        if (result.payload?.permissions) {
          const modules = result.payload.permissions.map((p: any) => p.module);
          setAvailableModules(modules);
          initializePermissions(modules);
        } else {
          console.warn("Using fallback modules");
          setAvailableModules(fallbackModules);
          initializePermissions(fallbackModules);
        }
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      setAvailableModules(fallbackModules);
      initializePermissions(fallbackModules);
    } finally {
      setLoading(false);
    }
  };

  const initializePermissions = (modules: string[]) => {
    const initialPermissions: PermissionItem[] = modules.map((module) => ({
      module: module,
      create: false,
      view: false,
      edit: false,
      delete: false,
    }));
    setPermissions(initialPermissions);
  };

  useEffect(() => {
    fetchModules();
  }, [dispatch, meData]);

  // Prefill edit data
  useEffect(() => {
    if (edit && rolesData && permissions.length > 0) {
      console.log("🔍 Editing role data:", rolesData);
      
      setUserRole(rolesData.userRole || "");
      setGroup(rolesData.Group || "");
      
      let apiPermissions: Record<string, any> = {};
      
      if (Array.isArray(rolesData.permissions)) {
        rolesData.permissions.forEach((perm: any) => {
          apiPermissions[perm.module] = perm;
        });
      } else {
        apiPermissions = rolesData.permissions || {};
      }
      
      console.log("📦 API Permissions mapping:", apiPermissions);

      const merged = permissions.map((item) => {
        const apiPerm = apiPermissions[item.module];
        if (apiPerm) {
          console.log(`📌 Module: ${item.module}`, {
            apiCanRead: apiPerm.canRead,
            apiCanCreate: apiPerm.canCreate,
            apiCanEdit: apiPerm.canEdit,
            apiCanDelete: apiPerm.canDelete
          });
          
          return {
            module: item.module,
            create: apiPerm.canCreate === true,
            view: apiPerm.canRead === true,
            edit: apiPerm.canEdit === true,
            delete: apiPerm.canDelete === true,
          };
        }
        return item;
      });
      
      console.log("✅ Merged permissions:", merged);
      setPermissions(merged);
    }
  }, [edit, rolesData, permissions.length]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!userRole.trim()) {
      errors.userRole = "Role name is required";
    } else if (userRole.trim().length < 2) {
      errors.userRole = "Role name must be at least 2 characters";
    } else if (userRole.trim().length > 50) {
      errors.userRole = "Role name must be less than 50 characters";
    }
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      warningAlert("Please fix the validation errors", "Got it");
      return false;
    }
    return true;
  };

  const buildPayload = (): ApiPayload => {
    const permissionsArray = permissions.map((item) => {
      const permission = {
        module: item.module,
        canCreate: item.create,
        canRead: item.view,
        canEdit: item.edit,
        canDelete: item.delete,
      };
      
      console.log(`📤 Building payload for ${item.module}:`, permission);
      return permission;
    });

    const payload: ApiPayload = {
      userRole: userRole.trim(),
      permissions: permissionsArray,
    };

    if (group && group.trim()) {
      payload.Group = group.trim();
    }

    console.log("📤 Final payload:", JSON.stringify(payload, null, 2));
    return payload;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    console.log("📊 Current permissions state before submit:", permissions);

    confirmAlert({
      title: edit ? "Update Role" : "Create Role",
      message: `Are you sure you want to ${edit ? "update" : "create"} "${userRole}" role?`,
      confirmText: edit ? "Update" : "Create",
      cancelText: "Cancel",
      onConfirm: async () => {
        const payload = buildPayload();
        
        setSubmitting(true);
        
        try {
          let response;
          if (edit) {
            response = await Create_Permissions_Edit(permissionId, payload);
            const successMsg = response?.data?.message || "Role updated successfully!";
            successAlert(successMsg, "Done", "Success!");
          } else {
            response = await Create_Permissions_Create(payload);
            const successMsg = response?.data?.message || "Role created successfully!";
            successAlert(successMsg, "Done", "Success!");
          }
          
          setTimeout(() => {
            navigate(-1);
          }, 1500);
        } catch (err: any) {
          console.error(err);
          const errorMessage = extractErrorMessage(err);
          
          if (errorMessage.toLowerCase().includes('duplicate')) {
            errorAlert(errorMessage, "Try Different Name", "Duplicate Entry");
          } else if (errorMessage.toLowerCase().includes('validation')) {
            errorAlert(errorMessage, "Fix Errors", "Validation Error");
          } else {
            errorAlert(errorMessage, "Try Again", "Submission Failed");
          }
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleCancel = () => {
    if (userRole.trim() || group.trim()) {
      confirmAlert({
        title: "Cancel Changes?",
        message: "You have unsaved changes. Are you sure you want to leave?",
        confirmText: "Yes, Leave",
        cancelText: "No, Stay",
        onConfirm: () => {
          navigate(-1);
        },
      });
    } else {
      navigate(-1);
    }
  };

  // Debug: Log permissions whenever they change
  useEffect(() => {
    console.log("🔄 Permissions updated:", permissions);
  }, [permissions]);

  if (loading || meLoading) {
    return <RippleLoader />;
  }

  return (
    <>
      {submitting && <RippleLoader />}
      
      <div className={`p-6 rounded-lg shadow-sm ${getCardBg()} ${getCardBorder()}`}>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleCancel}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${getBackButtonBg()}`}
            disabled={submitting}
          >
            <ArrowLeft size={20} className={getBackButtonColor()} />
          </button>
          <div>
            <h2 className={`text-xl font-bold ${getTitleColor()}`}>
              {edit ? "Edit Role" : "Create Role"}
            </h2>
            <p className={`text-sm mt-1 ${getSubtitleColor()}`}>
              {edit ? "Update role permissions and settings" : "Configure a new role with specific permissions"}
            </p>
          </div>
          <div className={`ml-auto text-sm px-3 py-1 rounded-full ${getModuleCountBg()}`}>
            Total Modules: {availableModules.length}
          </div>
        </div>

        {/* Role Input */}
        <div className="mb-4">
          <label className={`block text-sm font-semibold mb-2 ${getLabelColor()}`}>
            Role Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Sales Manager, Admin, Team Lead"
            value={userRole}
            onChange={(e) => {
              setUserRole(e.target.value);
              if (validationErrors.userRole) {
                setValidationErrors({});
              }
            }}
            className={`border ${validationErrors.userRole ? 'border-red-500' : ''} px-4 py-2.5 rounded-lg w-full focus:ring-2 outline-none transition-all ${getInputBg()} ${getInputFocusRing()}`}
            disabled={submitting}
          />
          {validationErrors.userRole && (
            <p className="text-xs text-red-500 mt-1">{validationErrors.userRole}</p>
          )}
        </div>

        {/* Group Input (Optional) */}
        <div className="mb-6">
          <label className={`block text-sm font-semibold mb-2 ${getLabelColor()}`}>
            Group (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Sales Team, Admin Team"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className={`px-4 py-2.5 rounded-lg w-full focus:ring-2 outline-none transition-all ${getInputBg()} ${getInputFocusRing()}`}
            disabled={submitting}
          />
          <p className={`text-xs mt-1 ${getHelperTextColor()}`}>
            Group helps organize roles with similar permissions
          </p>
        </div>

        {/* Permissions Table Component */}
        <div className={`border rounded-lg overflow-hidden ${getCardBorder()}`}>
          <div className={`px-4 py-3 border-b ${getPermissionsHeaderBg()} ${getPermissionsHeaderBorder()}`}>
            <h3 className={`font-semibold ${getPermissionsHeaderTitleColor()}`}>Module Permissions</h3>
            <p className={`text-xs mt-1 ${getPermissionsHeaderSubColor()}`}>
              Configure access rights for each module (Create, Read, Update, Delete)
            </p>
          </div>
          <div className={`p-4 ${getPermissionsContentBg()}`}>
            <Overall_Permissions
              permissionss={permissions}
              setPermissions={setPermissions}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="mt-8 flex justify-end gap-3">
          <Reusable_Button
            text="Cancel"
            onClick={handleCancel}
            variant="secondary"
            size="px-6 py-3"
            disabled={submitting}
          />
          <Reusable_Button
            text={submitting ? (edit ? "Updating..." : "Creating...") : (edit ? "Update Role Permissions" : "Save Role Permissions")}
            onClick={handleSubmit}
            variant="primary"
            size="px-3 py-2"
            disabled={submitting}
            isLoading={submitting}
          />
        </div>
      </div>
    </>
  );
};

export default Create_PermisionRole;