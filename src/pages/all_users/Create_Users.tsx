import {
  ArrowLeft,
  Briefcase,
  Building2,
  Globe,
  IndianRupee,
  Loader2,
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
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import Reusable_Button from '../../component/button/Reusable_Button';
import Reusable_Fields from '../../component/Fields/Reusable_Fiealds';
import RippleLoader from '../../component/Loader/RippleLoader';
import { errorAlert, successAlert, warningAlert } from '../../component/Notification/statusHandler';
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

interface ApiPermission {
  module: string;
  canCreate: boolean;
  canRead: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface Role {
  _id: string;
  userRole: string;
  Group?: string;
  permissions: ApiPermission[];
  createdBy?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  userRole: string;
  userRoleId: string;
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
  userRoleId?: string;
  company?: string;
  salaryPerMonth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  permissions?: ApiPermission[];
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  userRole?: string;
}

// --- Tooltip Component with Theme Support ---
const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => {
  const { darkMode } = useSelector((state: any) => state.theme);
  
  return (
    <div className="group relative flex flex-col items-center">
      {children}
      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 animate-in fade-in zoom-in-95 duration-200">
        <span className={`relative z-10 px-2 py-1 text-[10px] font-semibold text-white whitespace-nowrap shadow-md rounded-md ${
          darkMode ? 'bg-gray-800' : 'bg-slate-800'
        }`}>
          {text}
        </span>
        <div className={`w-2 h-2 -mt-1 rotate-45 rounded-sm ${
          darkMode ? 'bg-gray-800' : 'bg-slate-800'
        }`}></div>
      </div>
    </div>
  );
};

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Error occurred while saving user. Please try again.";
  
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
  } else if (error?.errors) {
    if (typeof error.errors === 'string') {
      errorMessage = error.errors;
    } else if (typeof error.errors === 'object') {
      const firstErrorKey = Object.keys(error.errors)[0];
      if (firstErrorKey && error.errors[firstErrorKey]) {
        errorMessage = Array.isArray(error.errors[firstErrorKey]) 
          ? error.errors[firstErrorKey][0] 
          : error.errors[firstErrorKey];
      }
    }
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
    if (errorMessage.toLowerCase().includes('email')) {
      errorMessage = "A user with this email address already exists. Please use a different email.";
    } else if (errorMessage.toLowerCase().includes('mobile')) {
      errorMessage = "A user with this mobile number already exists. Please use a different number.";
    } else {
      errorMessage = "A user with this information already exists. Please check and try again.";
    }
  }
  
  return errorMessage;
};

// Convert API permissions to component permission format
const convertApiPermissionsToComponentFormat = (apiPermissions: ApiPermission[]): Permission[] => {
  if (!apiPermissions || !Array.isArray(apiPermissions)) return [];
  
  return apiPermissions.map(perm => ({
    module: perm.module,
    create: perm.canCreate || false,
    view: perm.canRead || false,
    edit: perm.canEdit || false,
    delete: perm.canDelete || false
  }));
};

// Convert component permissions to API format
const convertComponentPermissionsToApiFormat = (componentPermissions: Permission[]): ApiPermission[] => {
  if (!componentPermissions || !Array.isArray(componentPermissions)) return [];
  
  return componentPermissions.map(perm => ({
    module: perm.module,
    canCreate: perm.create || false,
    canRead: perm.view || false,
    canEdit: perm.edit || false,
    canDelete: perm.delete || false
  }));
};

// Get all unique modules from roles
const getAllModulesFromRoles = (roles: Role[]): string[] => {
  const modulesSet = new Set<string>();
  roles.forEach(role => {
    if (role.permissions && Array.isArray(role.permissions)) {
      role.permissions.forEach(perm => {
        if (perm.module) {
          modulesSet.add(perm.module);
        }
      });
    }
  });
  return Array.from(modulesSet);
};

// Create default permissions from modules
const createDefaultPermissionsFromModules = (modules: string[]): Permission[] => {
  return modules.map(module => ({
    module: module,
    create: false,
    view: false,
    edit: false,
    delete: false
  }));
};

// --- Animation Variants ---
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
  const { primaryColor, darkMode } = useSelector((state: any) => state.theme);

  const { edit, editData, userId } = location.state || {};

  // 🔹 FORM STATE
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    userRole: '',
    userRoleId: '',
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
  const [fetchingRoles, setFetchingRoles] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Theme-based styles
  const getPageBg = () => darkMode ? 'bg-gray-900' : 'bg-[#F8FAFC]';
  const getCardBg = () => darkMode ? 'bg-gray-800' : 'bg-white';
  const getCardBorder = () => darkMode ? 'border-gray-700' : 'border-slate-200/60';
  const getHeaderIconBg = () => darkMode ? 'bg-gray-700' : 'bg-indigo-100';
  const getHeaderIconColor = () => darkMode ? primaryColor || '#818CF8' : '#6366f1';
  const getTitleColor = () => darkMode ? 'text-white' : 'text-slate-900';
  const getSubtitleColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';
  const getBackButtonBg = () => darkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600';
  const getSectionBorder = () => darkMode ? 'border-gray-700' : 'border-slate-100';
  const getSectionTitleColor = () => darkMode ? 'text-gray-200' : 'text-slate-800';
  const getSectionIconColor = () => darkMode ? primaryColor || '#818CF8' : '#6366f1';
  const getPermissionsBg = () => darkMode ? 'bg-gray-700/50' : 'bg-slate-50/50';
  const getPermissionsBorder = () => darkMode ? 'border-gray-700' : 'border-slate-100';
  const getEmptyStateBg = () => darkMode ? 'bg-gray-800' : 'bg-slate-50/50';
  const getEmptyStateBorder = () => darkMode ? 'border-gray-700' : 'border-slate-100';
  const getEmptyStateIconColor = () => darkMode ? 'text-gray-600' : 'text-slate-300';
  const getEmptyStateTextColor = () => darkMode ? 'text-gray-400' : 'text-slate-500';
  const getFormFooterBorder = () => darkMode ? 'border-gray-700' : 'border-slate-100';

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setFetchingRoles(true);
        const response = await Permissions_getall_User();
        const rolesData = response?.data?.data || [];
        setRoles(rolesData);
        
        const allModules = getAllModulesFromRoles(rolesData);
        if (allModules.length > 0) {
          setPermissions(createDefaultPermissionsFromModules(allModules));
        }
      } catch (error: any) {
        errorAlert(extractErrorMessage(error), "Retry");
      } finally {
        setFetchingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  // Handle edit data population
  useEffect(() => {
    if (edit && editData) {
      const data = editData as EditData;
      
      const selectedRole = roles.find(role => role.userRole === data.userRole);
      
      setFormData({
        firstName: data.firstname || '',
        lastName: data.lastname || '',
        mobile: data.mobile || '',
        email: data.email || '',
        userRole: data.userRole || '',
        userRoleId: data.userRoleId || selectedRole?._id || '',
        companyId: data.company || '',
        salary: data.salaryPerMonth || '',
        street: data.address?.street || '',
        city: data.address?.city || '',
        state: data.address?.state || '',
        zipCode: data.address?.zipCode || '',
        country: data.address?.country || '',
      });
      
      if (data.permissions && Array.isArray(data.permissions)) {
        setPermissions(convertApiPermissionsToComponentFormat(data.permissions));
      } else if (selectedRole?.permissions) {
        setPermissions(convertApiPermissionsToComponentFormat(selectedRole.permissions));
      }
    }
  }, [edit, editData, roles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle mobile number validation - only allow numbers and limit to 10 digits
    if (name === 'mobile') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      if (numbersOnly.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numbersOnly }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === "userRole") {
      handleRoleChange(value);
    }
  };

  const handleRoleChange = (roleName: string) => {
    const selectedRole = roles.find(r => r.userRole === roleName);
    
    if (selectedRole && selectedRole.permissions) {
      if (!edit) {
        setPermissions(convertApiPermissionsToComponentFormat(selectedRole.permissions));
      }
      setFormData(prev => ({ ...prev, userRoleId: selectedRole._id }));
    } else {
      const allModules = getAllModulesFromRoles(roles);
      if (allModules.length > 0) {
        setPermissions(createDefaultPermissionsFromModules(allModules));
      }
    }
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

  const buildFinalPayload = () => {
    const apiPermissions = convertComponentPermissionsToApiFormat(permissions);
    
    return {
      firstname: formData.firstName,
      lastname: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
      userRole: formData.userRole,
      userRoleId: formData.userRoleId,
      company: formData.companyId || "self",
      salaryPerMonth: formData.salary,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      },
      permissions: apiPermissions,
      attendanceList: [],
      deleted: false,
    };
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }
    if (!formData.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else {
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(formData.mobile)) {
        errors.mobile = "Please enter a valid 10-digit mobile number";
      }
    }
    if (!formData.userRole) {
      errors.userRole = "Please select a user role";
    }
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      warningAlert("Please fill in all required fields correctly", "Got it");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = buildFinalPayload();

      let response;
      if (edit && userId) {
        response = await Edit_User(userId, payload);
        const successMsg = response?.data?.message || "User updated successfully!";
        successAlert(successMsg, "Done", "Success!");
      } else {
        response = await create_User(payload);
        const successMsg = response?.data?.message || "User created successfully!";
        successAlert(successMsg, "Done", "Success!");
      }
      navigate(-1);
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        errorAlert(errorMessage, "Try Different Values", "Duplicate Entry");
      } else if (errorMessage.toLowerCase().includes('validation')) {
        errorAlert(errorMessage, "Fix Errors", "Validation Error");
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
        errorAlert(errorMessage, "Retry", "Connection Error");
      } else {
        errorAlert(errorMessage, "Try Again", "Submission Failed");
      }
      console.error("User creation/update error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show loader while fetching roles
  if (fetchingRoles) {
    return <RippleLoader />;
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`min-h-screen py-8 px-6 lg:px-10 transition-colors duration-300 ${getPageBg()}`}
    >
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* --- LAYER 1: HERO HEADER --- */}
        <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Tooltip text="Go Back">
              <button 
                onClick={() => navigate(-1)}
                className={`p-2 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer border ${getBackButtonBg()}`}
              >
                <ArrowLeft size={18} />
              </button>
            </Tooltip>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${getHeaderIconBg()}`}>
              <UserPlus size={24} strokeWidth={2.5} style={{ color: getHeaderIconColor() }} />
            </div>
            <div>
              <h1 className={`text-2xl lg:text-3xl font-bold tracking-tight ${getTitleColor()}`}>
                {edit ? "Edit User Profile" : "Create New User"}
              </h1>
              <p className={`text-sm mt-1 ${getSubtitleColor()}`}>
                {edit ? "Update the details and permissions for this workspace member." : "Fill out the information below to add a new member to your workspace."}
              </p>
            </div>
          </div>
        </motion.header>

        {/* --- LAYER 2: UNIFIED FORM CARD --- */}
        <motion.main variants={itemVariants} className={`rounded-3xl shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border overflow-hidden ${getCardBg()} ${getCardBorder()}`}>
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-12">
            
            {/* PERSONAL DETAILS */}
            <section>
              <div className={`flex items-center gap-2 border-b pb-3 mb-6 ${getSectionBorder()}`}>
                <User size={20} style={{ color: getSectionIconColor() }} />
                <h3 className={`text-lg font-semibold tracking-tight ${getSectionTitleColor()}`}>Personal Information</h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <Reusable_Fields 
                    label="First Name" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    icon={<User size={18} />} 
                    required 
                    error={validationErrors.firstName}
                  />
                </div>
                <div>
                  <Reusable_Fields 
                    label="Last Name" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    required 
                    error={validationErrors.lastName}
                  />
                </div>
                <div>
                  <Reusable_Fields 
                    label="Mobile" 
                    name="mobile" 
                    value={formData.mobile} 
                    onChange={handleChange} 
                    icon={<Phone size={18} />} 
                    required 
                    error={validationErrors.mobile}
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
                <div>
                  <Reusable_Fields 
                    label="Email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    icon={<Mail size={18} />} 
                    required 
                    error={validationErrors.email}
                  />
                </div>
              </div>
            </section>

            {/* WORK DETAILS */}
            <section>
              <div className={`flex items-center gap-2 border-b pb-3 mb-6 ${getSectionBorder()}`}>
                <Briefcase size={20} style={{ color: getSectionIconColor() }} />
                <h3 className={`text-lg font-semibold tracking-tight ${getSectionTitleColor()}`}>Work Details</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Reusable_Fields
                    label="User Role"
                    name="userRole"
                    type="select"
                    options={roles.map((r: Role) => ({ label: r.userRole, value: r.userRole }))}
                    value={formData.userRole}
                    onChange={handleChange}
                    icon={<Shield size={18} />}
                    required
                    error={validationErrors.userRole}
                  />
                </div>
                <Reusable_Fields 
                  label="Company ID" 
                  name="companyId" 
                  value={formData.companyId} 
                  onChange={handleChange} 
                  icon={<Building2 size={18} />} 
                  placeholder="self" 
                />
                <Reusable_Fields 
                  label="Salary" 
                  name="salary" 
                  type="number" 
                  value={formData.salary} 
                  onChange={handleChange} 
                  icon={<IndianRupee size={18} />} 
                />
              </div>
            </section>

            {/* PERMISSIONS */}
            <section>
              <div className={`flex items-center justify-between border-b pb-3 mb-6 ${getSectionBorder()}`}>
                <div className="flex items-center gap-2">
                  <Shield size={20} style={{ color: getSectionIconColor() }} />
                  <h3 className={`text-lg font-semibold tracking-tight ${getSectionTitleColor()}`}>Access Permissions</h3>
                </div>
                <Reusable_Button
                  text="Edit Global Role"
                  type="button"   
                  variant='ghost'
                  onClick={handleEditPermissions}
                  size='px-3 py-1.5 text-xs font-semibold'
                  disabled={!formData.userRole}
                />
              </div>
              {permissions.length > 0 ? (
                <div className={`rounded-2xl border p-2 sm:p-6 ${getPermissionsBg()} ${getPermissionsBorder()}`}>
                  <Overall_Permissions
                    permissionss={permissions}
                    setPermissions={setPermissions}
                  />
                </div>
              ) : (
                <div className={`rounded-2xl border p-8 text-center ${getEmptyStateBg()} ${getEmptyStateBorder()}`}>
                  <Shield size={40} className={`mx-auto mb-3 ${getEmptyStateIconColor()}`} />
                  <p className={getEmptyStateTextColor()}>No permissions available. Please select a role first.</p>
                </div>
              )}
            </section>

            {/* ADDRESS */}
            <section>
              <div className={`flex items-center gap-2 border-b pb-3 mb-6 ${getSectionBorder()}`}>
                <MapPin size={20} style={{ color: getSectionIconColor() }} />
                <h3 className={`text-lg font-semibold tracking-tight ${getSectionTitleColor()}`}>Location</h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Reusable_Fields 
                  label="Street Address" 
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
                  label="State / Province" 
                  name="state" 
                  value={formData.state} 
                  onChange={handleChange} 
                />
                <Reusable_Fields 
                  label="Zip Code" 
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

            {/* FORM FOOTER */}
            <div className={`flex items-center justify-end gap-4 pt-6 border-t ${getFormFooterBorder()}`}>
              <Reusable_Button
                text="Cancel"
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
                size="px-5 py-2.5 font-medium"
                disabled={loading}
              />
              <Reusable_Button
                text={loading ? "Saving Record..." : edit ? "Update User" : "Create User"}
                type="submit"
                variant="primary"
                icon={loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                size="px-6 py-2.5 font-semibold rounded-xl"
                disabled={loading}
              />
            </div>
            
          </form>
        </motion.main>
      </div>

      {/* Global loader overlay for async operations */}
      {loading && <RippleLoader />}
    </motion.div>
  );
};

export default Create_Users;