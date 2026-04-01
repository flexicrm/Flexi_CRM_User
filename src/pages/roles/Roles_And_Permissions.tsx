import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Reusable_Button from "../../component/button/Reusable_Button";
import Overall_Permissions from "../../component/permissions/Overall_Permissions";
import {
  Create_Permissions_Delete,
  Permissions_getall
} from "../../store/homepage_slice/Permissions_Slice";

// Import your custom notification handlers
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
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
};

type ApiResponse = {
  permissions?: Record<string, ApiPermission>;
  userRole?: string;
  _id?: string;
};

const Roles_And_Permissions: React.FC = () => {
  const navigate = useNavigate();

  const [getPermission, setGetPermission] = useState<ApiResponse | null>(null);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Helper to extract error message
  const getErrorMessage = (err: any) => {
    return err?.response?.data?.message || err?.message || "Something went wrong";
  };

  // Fetch Data
  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await Permissions_getall();

      const apiData: ApiResponse = response?.data?.data?.[0] || {};
      const apiPermissions = apiData?.permissions || {};

      const formattedPermissions: PermissionItem[] = Object.entries(apiPermissions).map(
        ([moduleName, perm]) => ({
          module: moduleName,
          create: !!perm?.canCreate,
          view: !!perm?.canRead,
          edit: !!perm?.canUpdate,
          delete: !!perm?.canDelete,
        })
      );

      setPermissions(formattedPermissions);
      setGetPermission(apiData);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      errorAlert("Failed to load permissions. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // ✅ UPDATED DELETE FUNCTION
  const handleDelete = () => {
    if (!getPermission?._id) {
      errorAlert("No permission ID found to delete.");
      return;
    }

    confirmAlert({
      title: "Delete Role",
      message: `Are you sure you want to delete the role "${getPermission.userRole}"? This action cannot be undone.`,
      confirmText: "Delete Role",
      onConfirm: async () => {
        try {
          setLoading(true);
          const id: string = getPermission._id!;
          
          const response = await Create_Permissions_Delete(id);
          
          successAlert(response?.data?.message || "Role deleted successfully");

          // Clear UI after delete
          setPermissions([]);
          setGetPermission(null);
          
          // Optional: Re-fetch if there are multiple roles
          // await fetchPermissions();

        } catch (error: any) {
          console.error("Delete error:", error);
          errorAlert(getErrorMessage(error));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // EDIT FUNCTION
  const handleEdit = () => {
    if (!getPermission) return;
    navigate(
      `/${localStorage.getItem("subdomain")}/roles/create-role`,
      {
        state: {
          edit: true,
          rolesData: getPermission,
          permissionId: getPermission?._id,
        },
      }
    );
  };

  // CREATE FUNCTION
  const handleCreate = () => {
    navigate(`/${localStorage.getItem("subdomain")}/roles/create-role`);
  };

  if (loading && !permissions.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Roles And Permissions</h2>
          {getPermission?.userRole && (
            <p className="mt-1 text-slate-500">
              <span className="font-medium text-indigo-600">Active Role:</span> {getPermission.userRole}
            </p>
          )}
        </div>

        <Reusable_Button
          text="Create New Role"
          onClick={handleCreate}
          variant="primary"
          size="px-6 py-2.5"
        />
      </div>

      <div className="mt-6">
        {permissions.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
             <Overall_Permissions
                permissions={permissions}
                setPermissions={setPermissions}   
                customizeButtom={true}
                editOnclick={handleEdit}
                deleteOnclick={handleDelete}
              />
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No roles found.</p>
            <button 
              onClick={handleCreate}
              className="mt-4 text-indigo-600 font-bold hover:underline"
            >
              Click here to create your first role
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roles_And_Permissions;