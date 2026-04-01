import {
  Briefcase,
  Building2,
  Globe,
  IndianRupee,
  Lock,
  Mail,
  Phone,
  User
} from 'lucide-react';

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Reusable_Button from '../../component/button/Reusable_Button';
import Reusable_Fields from '../../component/Fields/Reusable_Fiealds';
import Overall_Permissions from '../../component/permissions/Overall_Permissions';

import {
  create_User,
  Edit_User,
  Permissions_getall_User
} from '../../store/homepage_slice/AllUsers_Slice';

// Define Permission interface
interface Permission {
  module: string;
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

// Define Role interface
interface Role {
  userRole: string;
  permissions?: {
    [key: string]: {
      canCreate?: boolean;
      canRead?: boolean;
      canUpdate?: boolean;
      canDelete?: boolean;
    };
  };
  _id?: string;
}

// Define FormData interface
interface FormData {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  password: string;
  userRole: string;
  companyId: string;
  salary: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Define EditData interface
interface EditData {
  firstname?: string;
  lastname?: string;
  mobile?: string;
  email?: string;
  userRole?: string;
  company?: string;
  salaryPerMonth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

const Create_Users: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { edit, editData, userId } = location.state || {};
  console.log("🚀 ~ file: Create_Users.tsx:29 ~ Create_Users ~ editData:", editData, edit);

  // 🔹 FORM
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    password: '',
    userRole: '',
    companyId: '',
    salary: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 DEFAULT PERMISSIONS
  const defaultPermissions: Permission[] = [
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

  // 🔹 HANDLE CHANGE
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "userRole") {
      handleRoleChange(value);
    }
  };

  // 🔹 FETCH ROLES
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await Permissions_getall_User();
        setRoles(res?.data?.data || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  // 🔥 CREATE MODE → LOAD DEFAULT PERMISSIONS
  useEffect(() => {
    if (!edit) {
      setPermissions(defaultPermissions);
    }
  }, [edit]);

  // 🔹 PREFILL EDIT
  useEffect(() => {
    if (edit && editData) {
      const data = editData as EditData;
      setFormData({
        firstName: data.firstname || '',
        lastName: data.lastname || '',
        mobile: data.mobile || '',
        email: data.email || '',
        password: '',
        userRole: data.userRole || '',
        companyId: data.company || '',
        salary: data.salaryPerMonth || '',
        street: data.address?.street || '',
        city: data.address?.city || '',
        state: data.address?.state || '',
        zipCode: data.address?.zipCode || '',
        country: data.address?.country || '',
      });

      if (data.userRole) {
        handleRoleChange(data.userRole);
      }
    }
  }, [edit, editData, roles]);

  // 🔹 ROLE CHANGE
  const handleRoleChange = (roleName: string) => {
    const role = roles.find(r => r.userRole === roleName);

    if (!role?.permissions) {
      setPermissions(defaultPermissions);
      return;
    }

    const mapped = defaultPermissions.map(item => {
      const p = role.permissions?.[item.module] || {};

      return {
        module: item.module,
        create: !!p.canCreate,
        view: !!p.canRead,
        edit: !!p.canUpdate,
        delete: !!p.canDelete,
      };
    });

    setPermissions(mapped);
  };

  const handleEditPermissions = () => {
    const selectedRole = roles.find(r => r.userRole === formData.userRole);

    if (!selectedRole) {
      alert("Please select a role first");
      return;
    }

    navigate(
      `/${localStorage.getItem("subdomain")}/roles/create-role`,
      {
        state: {
          edit: true,
          rolesData: selectedRole,
          permissionId: selectedRole?._id,
        },
      }
    );
  };

  // 🔹 BUILD PERMISSION PAYLOAD
  const buildPermissionPayload = () => {
    const obj: any = {};

    permissions.forEach(item => {
      obj[item.module] = {
        canCreate: item.create,
        canRead: item.view,
        canUpdate: item.edit,
        canDelete: item.delete,
      };
    });

    return obj;
  };

  // 🔹 FINAL PAYLOAD
  const buildFinalPayload = () => ({
    firstname: formData.firstName,
    lastname: formData.lastName,
    email: formData.email,
    mobile: formData.mobile,
    password: formData.password,
    userRole: formData.userRole,
    company: formData.companyId || "self",
    salaryPerMonth: formData.salary,

    address: {
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
    },

    permissions: buildPermissionPayload(),
    attendanceList: [],
    deleted: false,
  });

  // 🔹 SUBMIT
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = buildFinalPayload();

      if (edit && userId) {
        await Edit_User(userId, payload);
        alert("User Updated Successfully");
      } else {
        await create_User(payload);
        alert("User Created Successfully");
      }

      navigate(-1);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Error occurred while saving user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-3xl max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">
        {edit ? "Edit User" : "Create User"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* PERSONAL */}
        <section>
          <div className="grid md:grid-cols-4 gap-6">
            <Reusable_Fields 
              label="First Name" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              icon={<User size={18} />} 
            />
            <Reusable_Fields 
              label="Last Name" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
            />
            <Reusable_Fields 
              label="Mobile" 
              name="mobile" 
              value={formData.mobile} 
              onChange={handleChange} 
              icon={<Phone size={18} />} 
            />
            <Reusable_Fields 
              label="Email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              icon={<Mail size={18} />} 
            />
            {!edit && (
              <Reusable_Fields 
                label="Password" 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                icon={<Lock size={18} />} 
              />
            )}
          </div>
        </section>

        {/* WORK */}
        <section>
          <div className="grid md:grid-cols-3 gap-6">
            <Reusable_Fields
              label="User Role"
              name="userRole"
              type="select"
              options={(roles || []).map((r: Role) => ({
                label: r.userRole,
                value: r.userRole,
              }))}
              value={formData.userRole}
              onChange={handleChange}
              icon={<Briefcase size={18} />}
            />

            <Reusable_Fields 
              label="Company ID" 
              name="companyId" 
              value={formData.companyId} 
              onChange={handleChange} 
              icon={<Building2 size={18} />} 
            />
            <Reusable_Fields 
              label="Salary" 
              name="salary" 
              value={formData.salary} 
              onChange={handleChange} 
              icon={<IndianRupee size={18} />} 
            />
          </div>
        </section>

        {/* PERMISSIONS */}
        <section>
          <Overall_Permissions
            permissions={permissions}
            setPermissions={setPermissions}
          />
          <div className='flex items-center justify-end mt-4'> 
            <Reusable_Button
              text="Edit Permissions"
              type="button"   
              onClick={handleEditPermissions}
              size='px-3 py-2.5'
            />
          </div>
        </section>

        {/* ADDRESS */}
        <section>
          <div className="grid md:grid-cols-4 gap-6">
            <Reusable_Fields 
              label="Street" 
              name="street" 
              value={formData.street} 
              onChange={handleChange} 
            />
            <Reusable_Fields 
              label="City" 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
            />
            <Reusable_Fields 
              label="State" 
              name="state" 
              value={formData.state} 
              onChange={handleChange} 
            />
            <Reusable_Fields 
              label="Zip" 
              name="zipCode" 
              value={formData.zipCode} 
              onChange={handleChange} 
            />
            <Reusable_Fields 
              label="Country" 
              name="country" 
              value={formData.country} 
              onChange={handleChange} 
              icon={<Globe size={18} />} 
            />
          </div>
        </section>

        {/* BUTTON */}
        <div className="flex justify-end">
          <Reusable_Button
            text={loading ? "Saving..." : edit ? "Update User" : "Create User"}
            type="submit"
            size='px-3 py-2.5'
          />
        </div>
      </form>
    </div>
  );
};

export default Create_Users;