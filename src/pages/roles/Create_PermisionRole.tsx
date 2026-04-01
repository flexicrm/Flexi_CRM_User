import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import Reusable_Button from "../../component/button/Reusable_Button";
import Overall_Permissions from "../../component/permissions/Overall_Permissions";
import {
  Create_Permissions_Create,
  Create_Permissions_Edit,
} from "../../store/homepage_slice/Permissions_Slice";

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
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
};

const defaultPermissions: PermissionItem[] = [
  { module: "Dashboard", create: false, view: false, edit: false, delete: false },
  { module: "Estimates", create: false, view: false, edit: false, delete: false },
  { module: "Expenses", create: false, view: false, edit: false, delete: false },
  { module: "Invoice", create: false, view: false, edit: false, delete: false },
  { module: "Leads", create: false, view: false, edit: false, delete: false },
  { module: "Order", create: false, view: false, edit: false, delete: false },
  { module: "Payments", create: false, view: false, edit: false, delete: false },
  { module: "Profile", create: false, view: false, edit: false, delete: false },
  { module: "Project", create: false, view: false, edit: false, delete: false },
  { module: "Proposals", create: false, view: false, edit: false, delete: false },
  { module: "Quotations", create: false, view: false, edit: false, delete: false },
  { module: "Report", create: false, view: false, edit: false, delete: false },
  { module: "RolesPermissions", create: false, view: false, edit: false, delete: false },
  { module: "Sales", create: false, view: false, edit: false, delete: false },
  { module: "Setup", create: false, view: false, edit: false, delete: false },
  { module: "Task", create: false, view: false, edit: false, delete: false },
  { module: "User", create: false, view: false, edit: false, delete: false },
  { module: "Utilities", create: false, view: false, edit: false, delete: false },
  { module: "setting", create: false, view: false, edit: false, delete: false },
  { module: "subscriptions", create: false, view: false, edit: false, delete: false },
];

const Create_PermisionRole = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { edit, rolesData, permissionId } = location.state || {};

  const [permissions, setPermissions] = useState<PermissionItem[]>(defaultPermissions);
  const [userRole, setUserRole] = useState("");

  // Helper to extract error message
  const getErrorMessage = (err: any) => {
    return err?.response?.data?.message || err?.message || "Something went wrong";
  };

  // PREFILL EDIT
  useEffect(() => {
    if (edit && rolesData) {
      setUserRole(rolesData.userRole || "");
      const apiPermissions = rolesData.permissions || {};

      const merged = defaultPermissions.map((item) => {
        const apiPerm = apiPermissions[item.module];
        return {
          module: item.module,
          create: !!apiPerm?.canCreate,
          view: !!apiPerm?.canRead,
          edit: !!apiPerm?.canUpdate,
          delete: !!apiPerm?.canDelete,
        };
      });
      setPermissions(merged);
    }
  }, [edit, rolesData]);

  const buildPayload = () => {
    const permissionsObj: Record<string, ApiPermission> = {};
    permissions.forEach((item) => {
      if (item.module === "Dashboard") {
        permissionsObj[item.module] = { canRead: !!item.view };
      } else {
        permissionsObj[item.module] = {
          canCreate: !!item.create,
          canRead: !!item.view,
          canUpdate: !!item.edit,
          canDelete: !!item.delete,
        };
      }
    });
    return { userRole, permissions: permissionsObj };
  };

  // ✅ SUBMIT WITH CONFIRMATION & API STATUS
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-6">{edit ? "Edit Role" : "Create Role"}</h2>

      {/* Role Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Role Name</label>
        <input
          type="text"
          placeholder="e.g. Sales Manager"
          value={userRole}
          onChange={(e) => setUserRole(e.target.value)}
          className="border border-gray-300 px-4 py-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      {/* Permissions Table Component */}
      <Overall_Permissions
        permissions={permissions}
        setPermissions={setPermissions}
      />

      {/* Submit */}
      <div className="mt-8 flex justify-end">
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