import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Reusable_Button from "../../component/button/Reusable_Button";
import Overall_Permissions from "../../component/permissions/Overall_Permissions";
import {
  Create_Permissions_Create,
  Create_Permissions_Edit,
} from "../../store/homepage_slice/Permissions_Slice";

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
  const { edit, rolesData, permissionId } = location.state || {};

  const [permissions, setPermissions] = useState<PermissionItem[]>(defaultPermissions);
  const [userRole, setUserRole] = useState("");

  //  PREFILL EDIT
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

  // ✅ BUILD PAYLOAD (Dashboard special)
  const buildPayload = () => {
    const permissionsObj: Record<string, ApiPermission> = {};

    permissions.forEach((item) => {
      if (item.module === "Dashboard") {
        permissionsObj[item.module] = {
          canRead: !!item.view,
        };
      } else {
        permissionsObj[item.module] = {
          canCreate: !!item.create,
          canRead: !!item.view,
          canUpdate: !!item.edit,
          canDelete: !!item.delete,
        };
      }
    });

    return {
      userRole,
      permissions: permissionsObj,
    };
  };

  // ✅ SUBMIT
  const handleSubmit = async () => {
    const payload = buildPayload();

    try {
      if (edit) {
        await Create_Permissions_Edit(permissionId, payload);
        alert("Updated successfully");
      } else {
        await Create_Permissions_Create(payload);
        alert("Created successfully");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <h2>{edit ? "Edit Role" : "Create Role"}</h2>

      {/* Role Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Role Name"
          value={userRole}
          onChange={(e) => setUserRole(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
      </div>

      {/* Permissions */}
      <Overall_Permissions
        permissions={permissions}
        setPermissions={setPermissions}
      />

      {/* Submit */}
      <div className="mt-4">
        <Reusable_Button
          text={edit ? "Update Role" : "Create Role"}
          onClick={handleSubmit}
          size="px-3 py-2.5"
        />
      </div>
    </div>
  );
};

export default Create_PermisionRole;