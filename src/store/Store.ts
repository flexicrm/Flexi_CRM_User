import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "../store/homepage_slice/Dashboard_Slice";
import authReducer from "./Login_Slice";
import allUsersReducer from "./homepage_slice/AllUsers_Slice";
import customerReducer from "./homepage_slice/Customer_Slice";
import leadsReducer from "./homepage_slice/Leads_slice";
import permissionsReducer from "./homepage_slice/Permissions_Slice";
import generatedCodeReducer from "./integrationSlice";
import followUpStatusReducer from "./settingFollowStatus";
import followUpTypeReducer from "./settingFollowtypeSlice";
import leadeStatusReducer from "./settingLeadeStatus";
import leadeSourceReducer from "./settingleadSourceSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    customer: customerReducer,
    allUsers: allUsersReducer,
    permissions: permissionsReducer,
    leads: leadsReducer,
     setting:followUpTypeReducer,
    followStatus: followUpStatusReducer,
    leadeStatus: leadeStatusReducer,
    leadSource: leadeSourceReducer,
    generatedCode: generatedCodeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
