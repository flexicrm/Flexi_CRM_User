import {
  ArrowLeft,
  Briefcase,
  Building2,
  Globe,
  IndianRupee,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User,
  UserPlus
} from 'lucide-react';

import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Reusable_Button from '../../component/button/Reusable_Button';
import Reusable_Fields from '../../component/Fields/Reusable_Fiealds';
import { errorAlert, successAlert } from '../../component/Notification/statusHandler';
import Overall_Permissions from '../../component/permissions/Overall_Permissions';

import {
  create_User,
  Edit_User,
  Permissions_getall_User
} from '../../store/homepage_slice/AllUsers_Slice';

// --- Types ---
interface Permission {
  module: string;
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

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

// Helper function to extract error message
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Error occurred while saving user. Please try again.";
  
  if (error?.response?.data) {
    const responseData = error.response.data;
    if (responseData.errors) {
      if (typeof responseData.errors === 'string') errorMessage = responseData.errors;
      else if (typeof responseData.errors === 'object') {
        const firstErrorKey = Object.keys(responseData.errors)[0];
        errorMessage = firstErrorKey && responseData.errors[firstErrorKey] ? responseData.errors[firstErrorKey] : JSON.stringify(responseData.errors);
      }
    }
    else if (responseData.message) errorMessage = responseData.message;
    else if (responseData.error) errorMessage = responseData.error;
  }
  else if (error?.errors) {
    if (typeof error.errors === 'string') errorMessage = error.errors;
    else if (typeof error.errors === 'object') {
      const firstErrorKey = Object.keys(error.errors)[0];
      errorMessage = firstErrorKey && error.errors[firstErrorKey] ? error.errors[firstErrorKey] : JSON.stringify(error.errors);
    }
  }
  else if (error?.message) errorMessage = error.message;
  
  return errorMessage;
};

// --- Animation Variants (FIXED) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 350, damping: 25 },
  },
};

const Create_Users: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { edit, editData, userId } = location.state || {};

  // 🔹 FORM STATE
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "userRole") handleRoleChange(value);
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await Permissions_getall_User();
        setRoles(res?.data?.data || []);
      } catch (error: any) {
        errorAlert(extractErrorMessage(error), "Retry");
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (!edit) setPermissions(defaultPermissions);
  }, [edit]);

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
      if (data.userRole) handleRoleChange(data.userRole);
    }
  }, [edit, editData, roles]);

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
      errorAlert("Please select a role first before editing permissions.", "Okay");
      return;
    }
    navigate(`/${localStorage.getItem("subdomain")}/roles/create-role`, {
      state: { edit: true, rolesData: selectedRole, permissionId: selectedRole?._id },
    });
  };

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

  const validateForm = () => {
    if (!formData.firstName.trim()) { errorAlert("First name is required", "Okay"); return false; }
    if (!formData.lastName.trim()) { errorAlert("Last name is required", "Okay"); return false; }
    if (!formData.email.trim()) { errorAlert("Email is required", "Okay"); return false; }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) { errorAlert("Please enter a valid email address", "Okay"); return false; }
    if (!formData.mobile.trim()) { errorAlert("Mobile number is required", "Okay"); return false; }
    if (!formData.userRole) { errorAlert("Please select a user role", "Okay"); return false; }
    if (!edit && !formData.password.trim()) { errorAlert("Password is required for new users", "Okay"); return false; }
    if (formData.password && formData.password.length < 6) { errorAlert("Password must be at least 6 characters long", "Okay"); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = buildFinalPayload();

      if (edit && userId) {
        const response = await Edit_User(userId, payload);
        successAlert(response?.data?.message || "User updated successfully!", "Done");
      } else {
        const response = await create_User(payload);
        successAlert(response?.data?.message || "User created successfully!", "Done");
      }
      navigate(-1);
    } catch (err: any) {
      errorAlert(extractErrorMessage(err), "Retry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#F8FAFC] py-8 px-6 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* --- LAYER 1: HERO HEADER --- */}
        <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
              <UserPlus size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                {edit ? "Edit User Profile" : "Create New User"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {edit ? "Update the details and permissions for this workspace member." : "Fill out the information below to add a new member to your workspace."}
              </p>
            </div>
          </div>
        </motion.header>

        {/* --- LAYER 2: UNIFIED FORM CARD --- */}
        <motion.main variants={itemVariants} className="bg-white rounded-3xl shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-slate-200/60 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-12">
            
            {/* PERSONAL DETAILS */}
            <section>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
                <User className="text-indigo-500" size={20} />
                <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Personal Information</h3>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                <Reusable_Fields label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} icon={<User size={18} />} required />
                <Reusable_Fields label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                <Reusable_Fields label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} icon={<Phone size={18} />} required />
                <Reusable_Fields label="Email" name="email" type="email" value={formData.email} onChange={handleChange} icon={<Mail size={18} />} required />
                {!edit && (
                  <Reusable_Fields label="Password" name="password" type="password" value={formData.password} onChange={handleChange} icon={<Lock size={18} />} required />
                )}
              </div>
            </section>

            {/* WORK DETAILS */}
            <section>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
                <Briefcase className="text-indigo-500" size={20} />
                <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Work Details</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <Reusable_Fields
                  label="User Role"
                  name="userRole"
                  type="select"
                  options={(roles || []).map((r: Role) => ({ label: r.userRole, value: r.userRole }))}
                  value={formData.userRole}
                  onChange={handleChange}
                  icon={<Shield size={18} />}
                  required
                />
                <Reusable_Fields label="Company ID" name="companyId" value={formData.companyId} onChange={handleChange} icon={<Building2 size={18} />} placeholder="self" />
                <Reusable_Fields label="Salary" name="salary" type="number" value={formData.salary} onChange={handleChange} icon={<IndianRupee size={18} />} />
              </div>
            </section>

            {/* PERMISSIONS */}
            <section>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="text-indigo-500" size={20} />
                  <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Access Permissions</h3>
                </div>
                <Reusable_Button
                  text="Edit Global Role"
                  type="button"   
                  variant='ghost'
                  onClick={handleEditPermissions}
                  size='px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200'
                />
              </div>
              <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-2 sm:p-6">
                <Overall_Permissions
                  permissionss={permissions}
                  setPermissions={setPermissions}
                />
              </div>
            </section>

            {/* ADDRESS */}
            <section>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
                <MapPin className="text-indigo-500" size={20} />
                <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Location</h3>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                <Reusable_Fields label="Street Address" name="street" value={formData.street} onChange={handleChange} />
                <Reusable_Fields label="City" name="city" value={formData.city} onChange={handleChange} />
                <Reusable_Fields label="State / Province" name="state" value={formData.state} onChange={handleChange} />
                <Reusable_Fields label="Zip Code" name="zipCode" value={formData.zipCode} onChange={handleChange} />
                <Reusable_Fields label="Country" name="country" value={formData.country} onChange={handleChange} icon={<Globe size={18} />} />
              </div>
            </section>

            {/* FORM FOOTER */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
              <Reusable_Button
                text="Cancel"
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
                size="px-5 py-2.5 font-medium"
              />
              <Reusable_Button
                text={loading ? "Saving Record..." : edit ? "Update User" : "Create User"}
                type="submit"
                variant="primary"
                icon={loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                size="px-6 py-2.5 font-semibold shadow-lg shadow-indigo-200/50 rounded-xl"
                disabled={loading}
              />
            </div>
            
          </form>
        </motion.main>
      </div>
    </motion.div>
  );
};

export default Create_Users;