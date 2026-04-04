import { Plus } from "lucide-react";
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


const RolesAndPermission = () => {
  const [permissionss, setPermissions] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
          {val || "-"}
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

  if (loading) {
    return <RippleLoader />;
  }

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 p-4 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage user roles and their access permissions
          </p>
        </div>

        <Reusable_Button
          text="Add Role"
          onClick={handleCreate}
          icon={<Plus size={16} />}
          disabled={!Roles?.canCreate}
        />
      </div>

      <Table
        columns={columns}
        data={filteredData}
        actionButtons={{
          showView: !!Roles?.canRead,
          onView: (record: RoleItem) => {
            if (!Roles?.canRead) {
              return;
            }
            const subdomain = localStorage.getItem("subdomain") || "default";
            navigate(`/${subdomain}/rolesand-permissions/view`, {
              state: {
                tableId: record.index,
              },
            });
          },
        }}
      />

      {filteredData.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500">No roles found</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RolesAndPermission;