import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Table, { type Column } from "../../component/table/Table";
import { Permissions_getall } from "../../store/homepage_slice/Permissions_Slice";

type RoleItem = {
  Group: string;
  userRole: string;
  permissions: any[];
  _id: string;
  index?: number;
};

const RolesAndPermission = () => {
  const [permissionss, setPermissions] = useState<RoleItem[]>([]);

  const { permissions } = useSelector((state: any) => state.auth);
  const Roles = permissions?.[5];
  const navigate = useNavigate();
  const columns: Column[] = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (val: number) => (
        <span className="text-[13px] font-medium text-slate-600">
          {val + 1}
        </span>
      ),
    },
    {
      title: "Group",
      dataIndex: "Group",
      key: "Group",
      render: (val: string) => (
        <span className="text-[12px] font-bold text-[#0d1954] uppercase tracking-wider">
          {val}
        </span>
      ),
    },
    {
      title: "User Role",
      dataIndex: "userRole",
      key: "userRole",
      render: (val: string) => (
        <span className="text-[13px] text-slate-700 font-semibold">
          {val || "-"}
        </span>
      ),
    },
  ];

  // Fetch data
  const fetchPermissions = async () => {
    try {
      const response = await Permissions_getall();

      const apiData = response?.data?.data || [];

      // Add index (0, 1, 2...) into every row
      const updatedData = apiData.map((item: RoleItem, index: number) => ({
        ...item,
        index,
      }));

      setPermissions(updatedData);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return (
    <div>
      <Table
        columns={columns}
        data={permissionss}
        actionButtons={{
          showView: !!Roles?.canRead,

          onView: (record: RoleItem) => {
            if (!Roles?.canRead) return;

            const subdomain =
              localStorage.getItem("subdomain") || "default";

            navigate(`/${subdomain}/rolesand-permissions/view`, {
              state: {
                tableId: record.index, 
              },
            });
          },
        }}
      />
    </div>
  );
};

export default RolesAndPermission;