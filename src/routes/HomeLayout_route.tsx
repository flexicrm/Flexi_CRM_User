// import All_Users from "../pages/all_users/All_Users";
// import AllUser_Main from "../pages/all_users/AllUser_Main";
// import Create_Users from "../pages/all_users/Create_Users";
// import Customers from "../pages/customers/Customers";
// import Dashboard from "../pages/dashboard/Dashboard";
// import Create_Leads from "../pages/leads/Create_Leads";
// import Leads from "../pages/leads/Leads";
// import Leads_Main from "../pages/leads/Leads_Main";
// import View_Leads from "../pages/leads/View_Leads";
// import Create_PermisionRole from "../pages/roles/Create_PermisionRole";
// import Roles_And_Permissions from "../pages/roles/Roles_And_Permissions";
// import Roles_And_PermissionsMain from "../pages/roles/Roles_And_PermissionsMain";
// import RolesAndPermission from "../pages/roles/RolesAndPermission";
// import Settings from "../pages/settings/Settings";
// import Utilities from "../pages/utilities/Utilities";

// //  get subdomain BEFORE array
// const localstorageData = localStorage.getItem("subdomain");

// export const HomeLayout_route = [
//     {
//         path: `/${localstorageData}/dashboard`,
//         Component: Dashboard,
//     },
//     {
//         path: `/${localstorageData}/customer`,
//         Component: Customers,
//     },
//     {
//         path: `/${localstorageData}/user`,
//         Component: AllUser_Main,
//         children:[
//             {
//         index: true,
//         Component:All_Users,
//     },
//     {
//         path: `/${localstorageData}/user/alluser-create`,
//         Component:Create_Users,
//     },
//         ]
//     },
    
//     {
//         path: `/${localstorageData}/leads`,
//         Component: Leads_Main,
//         children : [
//             {
//                 index:true,
//                 Component:Leads,
//             },
//             {
//                 path: `/${localstorageData}/leads/view-leads`,
//                 Component:View_Leads,
//             },
//             {
//                 path: `/${localstorageData}/leads/create-leads`,
//                 Component:Create_Leads,
//             }
//         ]
//     },
//     {
//         path: `/${localstorageData}/utilities`,
//         Component: Utilities,
//     },
//     {
//         path: `/${localstorageData}/settings`,
//         Component: Settings,
//     },
//     {
//         path: `/${localstorageData}/rolesand-permissions`,
//         Component: Roles_And_PermissionsMain,
//         children:[
//             {
//                 index:true,
//                 Component: RolesAndPermission,
//             },
//             {
//                 path:`/${localstorageData}/rolesand-permissions/view`,
//                 Component: Roles_And_Permissions,
//             },
//             {
//                 path: `/${localstorageData}/rolesand-permissions/create-role`,
//                 Component: Create_PermisionRole,
//             }
//         ]
//     }
// ];

import All_Users from "../pages/all_users/All_Users";
import AllUser_Main from "../pages/all_users/AllUser_Main";
import Create_Users from "../pages/all_users/Create_Users";
import Customers from "../pages/customers/Customers";
import Dashboard from "../pages/dashboard/Dashboard";
import Create_Leads from "../pages/leads/Create_Leads";
import Leads from "../pages/leads/Leads";
import Leads_Main from "../pages/leads/Leads_Main";
import View_Leads from "../pages/leads/View_Leads";
import Create_PermisionRole from "../pages/roles/Create_PermisionRole";
import Roles_And_Permissions from "../pages/roles/Roles_And_Permissions";
import Roles_And_PermissionsMain from "../pages/roles/Roles_And_PermissionsMain";
import RolesAndPermission from "../pages/roles/RolesAndPermission";
import Settings from "../pages/settings/Settings";
import Utilities from "../pages/utilities/Utilities";

// Function to get routes with current subdomain
export const getHomeLayoutRoutes = (subdomain: string | null) => {
  const basePath = subdomain ? `/${subdomain}` : "";
  
  return [
    {
      path: `${basePath}/dashboard`,
      Component: Dashboard,
    },
    {
      path: `${basePath}/customer`,
      Component: Customers,
    },
    {
      path: `${basePath}/user`,
      Component: AllUser_Main,
      children: [
        {
          index: true,
          Component: All_Users,
        },
        {
          path: `${basePath}/user/alluser-create`,
          Component: Create_Users,
        },
      ]
    },
    {
      path: `${basePath}/leads`,
      Component: Leads_Main,
      children: [
        {
          index: true,
          Component: Leads,
        },
        {
          path: `${basePath}/leads/view-leads`,
          Component: View_Leads,
        },
        {
          path: `${basePath}/leads/create-leads`,
          Component: Create_Leads,
        }
      ]
    },
    {
      path: `${basePath}/utilities`,
      Component: Utilities,
    },
    {
      path: `${basePath}/settings`,
      Component: Settings,
    },
    {
      path: `${basePath}/rolesand-permissions`,
      Component: Roles_And_PermissionsMain,
      children: [
        {
          index: true,
          Component: RolesAndPermission,
        },
        {
          path: `${basePath}/rolesand-permissions/view`,
          Component: Roles_And_Permissions,
        },
        {
          path: `${basePath}/rolesand-permissions/create-role`,
          Component: Create_PermisionRole,
        }
      ]
    }
  ];
};

// For backward compatibility, export a function that returns routes with current localStorage value
export const HomeLayout_route = getHomeLayoutRoutes(localStorage.getItem("subdomain"));