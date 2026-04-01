import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Reusable_Button from "../../component/button/Reusable_Button";
import Overall_Permissions from "../../component/permissions/Overall_Permissions";
import { Create_Permissions_Delete, Permissions_getall } from "../../store/homepage_slice/Permissions_Slice";

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // DELETE FUNCTION
  const handleDelete = async () => {
  //  Ensure ID exists
  if (!getPermission?._id) {
    alert("No permission ID found");
    return;
  }

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this role?"
  );

  if (!confirmDelete) return;

  try {
    setLoading(true);

    //  Store ID in variable (fixes TS undefined issue)
    const id: string = getPermission._id;

    await Create_Permissions_Delete(id);

    alert("Role deleted successfully");

    // ✅ Clear UI after delete
    setPermissions([]);
    setGetPermission(null);

    // 👉 Optional: re-fetch instead of clearing
    // await fetchPermissions();

  } catch (error: unknown) {
    console.error("Delete error:", error);

    // ✅ Safe error handling
    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("Failed to delete role");
    }
  } finally {
    setLoading(false);
  }
};

  // EDIT FUNCTION
  const handleEdit = () => {
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
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Roles And Permissions</h2>
          {getPermission?.userRole && (
            <p className="mt-2 text-gray-600">
              <strong>Current Role:</strong> {getPermission.userRole}
            </p>
          )}
        </div>

        <Reusable_Button
          text="Create Role"
          onClick={handleCreate}
          size="px-4 py-2.5"
        />
      </div>

      <div className="mt-6">
        {permissions.length > 0 ? (
          <Overall_Permissions
  permissions={permissions}
  setPermissions={setPermissions}   
  customizeButtom={true}
  editOnclick={handleEdit}
  deleteOnclick={handleDelete}
/>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No permissions found. Click "Create Role" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default Roles_And_Permissions;