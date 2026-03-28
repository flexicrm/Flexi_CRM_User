// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "../store/homepage_slice/Dashboard_Slice";
import authReducer from "./Login_Slice";
import allUsersReducer from "./homepage_slice/AllUsers_Slice";
import customerReducer from "./homepage_slice/Customer_Slice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    customer: customerReducer,
    allUsers: allUsersReducer,
  },
});

// TS types for dispatch & selector
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;