import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Reusable_Button from "../../component/button/Reusable_Button";
import Overall_Permissions from "../../component/permissions/Overall_Permissions";
import {
  Create_Permissions_Create,
  Create_Permissions_Edit,
} from "../../store/homepage_slice/Permissions_Slice";
import { fetchMeData } from "../../store/Login_Slice";

// Import the status handlers
import {
  confirmAlert,
  errorAlert,
  successAlert
} from "../../component/Notification/statusHandler";

type PermissionItem = {
  module: string;
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
};

type ApiPermission = {
  canCreate?: boolean;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

// API Payload type
type ApiPayload = {
  userRole: string;
  Group?: string;
  permissions: ApiPermission[];
};

// Fallback modules if API fails
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

const Create_PermisionRole = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { edit, rolesData, permissionId } = location.state || {};
  
  // Get meData from Redux store
  const { meData, meLoading } = useSelector((state: any) => state.auth);

  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [userRole, setUserRole] = useState("");
  const [group, setGroup] = useState("");
  const [loading, setLoading] = useState(true);
  const [availableModules, setAvailableModules] = useState<string[]>([]);

  // Helper to extract error message
  const getErrorMessage = (err: any) => {
    return err?.response?.data?.message || err?.message || "Something went wrong";
  };

  // Fetch module names from API (similar to sidebar)
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        
        // If meData is already in store, use it
        if (meData?.permissions && Array.isArray(meData.permissions)) {
          const modules = meData.permissions.map((p: any) => p.module);
          console.log("Modules from meData:", modules);
          setAvailableModules(modules);
          
          // Initialize permissions based on fetched modules
          initializePermissions(modules);
        } else {
          // Fetch fresh data
          const result = await dispatch(fetchMeData() as any);
          if (result.payload?.permissions) {
            const modules = result.payload.permissions.map((p: any) => p.module);
            console.log("Modules from fresh API:", modules);
            setAvailableModules(modules);
            initializePermissions(modules);
          } else {
            // Use fallback modules if API fails
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

    fetchModules();
  }, [dispatch, meData]);

  // Initialize permissions array based on modules
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

  // PREFILL EDIT DATA
  useEffect(() => {
    if (edit && rolesData && permissions.length > 0) {
      setUserRole(rolesData.userRole || "");
      setGroup(rolesData.Group || "");
      
      // Handle both array and object format for permissions
      let apiPermissions: any = {};
      
      if (Array.isArray(rolesData.permissions)) {
        // Convert array format to object for easier lookup
        rolesData.permissions.forEach((perm: any) => {
          apiPermissions[perm.module] = perm;
        });
      } else {
        apiPermissions = rolesData.permissions || {};
      }

      const merged = permissions.map((item) => {
        const apiPerm = apiPermissions[item.module];
        if (apiPerm) {
          return {
            module: item.module,
            create: apiPerm.canCreate || apiPerm.canCreate === true,
            view: apiPerm.canRead || apiPerm.canRead || false,
            edit: apiPerm.canEdit || apiPerm.canUpdate || false,
            delete: apiPerm.canDelete || false,
          };
        }
        return item;
      });
      setPermissions(merged);
    }
  }, [edit, rolesData, permissions.length]);

  // Build payload in the exact format specified
  const buildPayload = (): ApiPayload => {
    // Create permissions array in the format: [{ module: "Dashboard", canCreate: false, canView: true, ... }]
    const permissionsArray = permissions.map((item) => ({
      module: item.module,
      canCreate: item.create,
      canRead: item.view,
      canEdit: item.edit,
      canDelete: item.delete,
    }));

    const payload: ApiPayload = {
      userRole: userRole,
      permissions: permissionsArray,
    };

    // Add Group if provided
    if (group && group.trim()) {
      payload.Group = group;
    }

    return payload;
  };

  // Submit with confirmation
  const handleSubmit = () => {
    if (!userRole.trim()) {
      errorAlert("Please enter a role name", "Okay");
      return;
    }

    confirmAlert({
      title: edit ? "Update Role" : "Create Role",
      message: `Are you sure you want to ${edit ? "update" : "create"} this role?`,
      confirmText: edit ? "Update" : "Create",
      onConfirm: async () => {
        const payload = buildPayload();
        console.log("Submitting payload:", JSON.stringify(payload, null, 2));
        
        try {
          let response;
          if (edit) {
            response = await Create_Permissions_Edit(permissionId, payload);
            successAlert(response?.data?.message || "Role updated successfully!");
          } else {
            response = await Create_Permissions_Create(payload);
            successAlert(response?.data?.message || "Role created successfully!");
          }
          
          // Redirect back after success
          setTimeout(() => {
            navigate(-1);
          }, 1500);

        } catch (err: any) {
          console.error(err);
          errorAlert(getErrorMessage(err), "Retry");
        }
      },
    });
  };

  // Loading state
  if (loading || meLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading modules from API...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{edit ? "Edit Role" : "Create Role"}</h2>
        <div className="text-sm text-gray-500">
          Total Modules: {availableModules.length}
        </div>
      </div>

      {/* Role Input */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">
          Role Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Sales Manager, Admin, Team Lead"
          value={userRole}
          onChange={(e) => setUserRole(e.target.value)}
          className="border border-gray-300 px-4 py-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      {/* Group Input (Optional) */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">
          Group (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Sales Team, Admin Team"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="border border-gray-300 px-4 py-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      {/* Permissions Table Component - Now using dynamic modules from API */}
      <Overall_Permissions
        permissionss={permissions}
        setPermissions={setPermissions}
      />

      {/* Submit */}
      <div className="mt-8 flex justify-end gap-3">
        <Reusable_Button
          text="Cancel"
          onClick={() => navigate(-1)}
          variant="secondary"
          size="px-6 py-3"
        />
        <Reusable_Button
          text={edit ? "Update Role Permissions" : "Save Role Permissions"}
          onClick={handleSubmit}
          variant="primary"
          size="px-6 py-3"
        />
      </div>
    </div>
  );
};

export default Create_PermisionRole;