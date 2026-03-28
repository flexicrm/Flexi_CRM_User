import All_Users from "../pages/all_users/All_Users";
import Customers from "../pages/customers/Customers";
import Dashboard from "../pages/dashboard/Dashboard";
import Leads from "../pages/leads/Leads";
import Roles_And_Permissions from "../pages/roles/Roles_And_Permissions";
import Settings from "../pages/settings/Settings";
import Utilities from "../pages/utilities/Utilities";

// ✅ get subdomain BEFORE array
const localstorageData = localStorage.getItem("subdomain");

export const HomeLayout_route = [
    {
        path: `/${localstorageData}/dashboard`,
        Component: Dashboard,
    },
    {
        path: `/${localstorageData}/customers`,
        Component: Customers,
    },
    {
        path: `/${localstorageData}/all-users`,
        Component: All_Users,
    },
    {
        path: `/${localstorageData}/leads`,
        Component: Leads,
    },
    {
        path: `/${localstorageData}/utilities`,
        Component: Utilities,
    },
    {
        path: `/${localstorageData}/settings`,
        Component: Settings,
    },
    {
        path: `/${localstorageData}/roles`,
        Component: Roles_And_Permissions,
    }
];