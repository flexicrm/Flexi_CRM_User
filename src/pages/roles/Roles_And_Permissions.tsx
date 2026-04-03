// import { AnimatePresence, motion } from "framer-motion";
// import { Loader2, Plus, ShieldAlert, ShieldCheck } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import Reusable_Button from "../../component/button/Reusable_Button";
// import Overall_Permissions from "../../component/permissions/Overall_Permissions";
// import {
//   Create_Permissions_Delete,
//   Permissions_getall
// } from "../../store/homepage_slice/Permissions_Slice";

// // Import your custom notification handlers
// import {
//   confirmAlert,
//   errorAlert,
//   successAlert
// } from "../../component/Notification/statusHandler";

// type PermissionItem = {
//   module: string;
//   create: boolean;
//   view: boolean;
//   edit: boolean;
//   delete: boolean;
// };

// type ApiPermission = {
//   canCreate?: boolean;
//   canRead?: boolean;
//   canUpdate?: boolean;
//   canDelete?: boolean;
// };

// type ApiResponse = {
//   permissions?: Record<string, ApiPermission>;
//   userRole?: string;
//   _id?: string;
// };

// // --- Animation Variants (FIXED) ---
// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.12, delayChildren: 0.05 },
//   },
// };

// const itemVariants = {
//   hidden: { y: 15, opacity: 0 },
//   visible: {
//     y: 0,
//     opacity: 1,
//     transition: { type: "spring" as const, stiffness: 350, damping: 25 },
//   },
// };

// const Roles_And_Permissions: React.FC = () => {
//   const navigate = useNavigate();

//   const [getPermission, setGetPermission] = useState<ApiResponse | null>(null);
//   const [permissions, setPermissions] = useState<PermissionItem[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);

//   // Helper to extract error message
//   const getErrorMessage = (err: any) => {
//     return err?.response?.data?.message || err?.message || "Something went wrong";
//   };

//   // Fetch Data
//  const fetchPermissions = async () => {
//   try {
//     setLoading(true);
//     const response = await Permissions_getall();

//     const apiData: ApiResponse = response?.data?.data?.[0] || {};
//     const apiPermissions = apiData?.permissions || [];

//     // ✅ Handle dynamic modules safely
//     const formattedPermissions: PermissionItem[] = apiPermissions.map((perm) => ({
//       module: perm.module || "Unknown",
//       create: !!perm?.canCreate,
//       view: !!perm?.canRead,
//       edit: !!perm?.canEdit,
//       delete: !!perm?.canDelete,
//     }));

//     setPermissions(formattedPermissions);
//     setGetPermission(apiData);

//   } catch (error) {
//     console.error("Error fetching permissions:", error);
//     errorAlert("Failed to load permissions. Please refresh.", "Retry");
//   } finally {
//     setLoading(false);
//   }
// };

//   useEffect(() => {
//     fetchPermissions();
//   }, []);

//   // DELETE FUNCTION
//   const handleDelete = () => {
//     if (!getPermission?._id) {
//       errorAlert("No permission ID found to delete.");
//       return;
//     }

//     confirmAlert({
//       title: "Delete Role",
//       message: `Are you sure you want to delete the role "${getPermission.userRole}"? This action cannot be undone.`,
//       confirmText: "Delete Role",
//       cancelText: "Cancel",
//       onConfirm: async () => {
//         try {
//           setLoading(true);
//           const id: string = getPermission._id!;
          
//           const response = await Create_Permissions_Delete(id);
          
//           successAlert(response?.data?.message || "Role deleted successfully", "Done");

//           // Clear UI after delete
//           setPermissions([]);
//           setGetPermission(null);

//         } catch (error: any) {
//           console.error("Delete error:", error);
//           errorAlert(getErrorMessage(error), "Retry");
//         } finally {
//           setLoading(false);
//         }
//       },
//     });
//   };

//   // EDIT FUNCTION
//   const handleEdit = () => {
//     if (!getPermission) return;
//     navigate(
//       `/${localStorage.getItem("subdomain")}/roles/create-role`,
//       {
//         state: {
//           edit: true,
//           rolesData: getPermission,
//           permissionId: getPermission?._id,
//         },
//       }
//     );
//   };

//   // CREATE FUNCTION
//   const handleCreate = () => {
//     navigate(`/${localStorage.getItem("subdomain")}/roles/create-role`);
//   };

//   // FULL PAGE LOADING STATE
//   if (loading && !permissions.length) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#F8FAFC]">
//         <Loader2 className="animate-spin text-indigo-600 mb-4" size={42} />
//         <p className="text-slate-500 font-medium tracking-wide">Loading Security Policies...</p>
//       </div>
//     );
//   }

//   return (
//     <motion.div 
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//       className="min-h-screen bg-[#F8FAFC] py-8 px-6 lg:px-10"
//     >
//       <div className="max-w-[1600px] mx-auto space-y-8">
        
//         {/* --- LAYER 1: HERO HEADER --- */}
//         <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
//               <ShieldCheck size={24} strokeWidth={2.5} />
//             </div>
//             <div>
//               <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Roles & Permissions</h1>
//               <div className="flex items-center gap-3 mt-1">
//                 <p className="text-sm text-slate-500">Manage workspace access and security levels.</p>
//                 {getPermission?.userRole && (
//                   <>
//                     <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
//                     <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-sm">
//                       Active: {getPermission.userRole}
//                     </span>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>

//           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//             <Reusable_Button
//               text="Add New Role"
//               onClick={handleCreate}
//               variant="primary"
//               icon={<Plus size={18} />}
//               size='px-5 py-2.5 font-medium shadow-lg shadow-indigo-200/50 rounded-xl'
//             />
//           </motion.div>
//         </motion.header>

//         {/* --- LAYER 2: MAIN CONTENT --- */}
//         <motion.main variants={itemVariants}>
//           <AnimatePresence mode="wait">
//             {permissions.length > 0 ? (
//               // Active Roles Card
//               <motion.div 
//                 key="has-roles"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 className="bg-white rounded-3xl shadow-[0px_4px_24px_rgba(0,0,0,0.02)] border border-slate-200/60 overflow-hidden"
//               >
//                 <div className="p-2 sm:p-6">
//                   <Overall_Permissions
//                     permissions={permissions}
//                     setPermissions={setPermissions}   
//                     customizeButtom={true}
//                     editOnclick={handleEdit}
//                     deleteOnclick={handleDelete}
//                   />
//                 </div>
//               </motion.div>
//             ) : (
//               // Polished Empty State
//               <motion.div 
//                 key="empty-roles"
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.95 }}
//                 className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200"
//               >
//                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
//                   <ShieldAlert size={32} className="text-slate-400" />
//                 </div>
//                 <h3 className="text-lg font-bold text-slate-800 mb-1">No Roles Configured</h3>
//                 <p className="text-slate-500 mb-6 max-w-sm text-center text-sm">
//                   There are currently no custom roles or permissions set up in your workspace.
//                 </p>
//                 <Reusable_Button 
//                   text="Create Your First Role"
//                   onClick={handleCreate}
//                   variant="primary"
//                   icon={<Plus size={16} />}
//                 />
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </motion.main>
//       </div>
//     </motion.div>
//   );
// };

// export default Roles_And_Permissions;


// Roles_And_Permissions.tsx

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, ShieldAlert } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Reusable_Button from "../../component/button/Reusable_Button";
import Overall_Permissions from "../../component/permissions/Overall_Permissions";
import {
  Create_Permissions_Delete,
  Permissions_getall,
} from "../../store/homepage_slice/Permissions_Slice";

import { useSelector } from "react-redux";
import {
  confirmAlert,
  errorAlert,
  successAlert,
} from "../../component/Notification/statusHandler";

//  UPDATED TYPE
type PermissionItem = {
  module: string;
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
};

const Roles_And_Permissions: React.FC = () => {
  const navigate = useNavigate();

  const [getPermission, setGetPermission] = useState<any>(null);
  const [permissionss, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(false);
   const {permissions} = useSelector((state : any) => state.auth)
  const Roles = permissions[5]
  const location = useLocation();
  const {tableId} = location.state || {};

  //  FORMAT FUNCTION (CORE FIX)
  const formatPermissions = (permissionsArray: any[]): PermissionItem[] => {
    if (!Array.isArray(permissionsArray)) return [];
    
    return permissionsArray.map((perm) => ({
      module: perm.module,
      create: !!perm.canCreate,
      view: !!perm.canRead,
      edit: !!perm.canEdit,
      delete: !!perm.canDelete,
    }));
  };

  // FETCH
  const fetchPermissions = async () => {
    try {
      setLoading(true);

      const response = await Permissions_getall();

      const apiData = response?.data?.data?.[tableId] || {};

      const formatted = formatPermissions(apiData?.permissions);

      setPermissions(formatted);
      setGetPermission(apiData);
    } catch (error) {
      console.error(error);
      errorAlert("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // DELETE
  const handleDelete = () => {
    if (!getPermission?._id) {
      errorAlert("No permission ID found");
      return;
    }

    confirmAlert({
      title: "Delete Role",
      message: `Delete "${getPermission.userRole}"?`,
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          setLoading(true);

          const res = await Create_Permissions_Delete(getPermission._id);

          successAlert(res?.data?.message || "Deleted");

          setPermissions([]);
          setGetPermission(null);
        } catch (err: any) {
          errorAlert(err?.message || "Error deleting");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // EDIT
  const handleEdit = () => {
    navigate(`/${localStorage.getItem("subdomain")}/rolesand-permissions/create-role`, {
      state: {
        edit: true,
        rolesData: getPermission,
        permissionId: getPermission?._id,
      },
    });
  };

  // CREATE
  const handleCreate = () => {
    navigate(`/${localStorage.getItem("subdomain")}/rolesand-permissions/create-role`);
  };

  if (loading && !permissionss.length) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <motion.div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>

        <Reusable_Button
          text="Add Role"
          onClick={handleCreate}
          icon={<Plus size={16} />}
          disabled={!Roles?.canCreate}
        />
      </div>

      {/* CONTENT */}
      <AnimatePresence>
        {permissionss.length > 0 ? (
          <Overall_Permissions
            permissionss={permissionss}
            setPermissions={setPermissions}
            customizeButtom={true}
            editOnclick={handleEdit}
            deleteOnclick={handleDelete}
          />
        ) : (
          <div className="text-center py-20">
            <ShieldAlert size={40} className="mx-auto mb-4 text-gray-400" />
            <p>No Roles Found</p>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Roles_And_Permissions;