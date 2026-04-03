import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { Reusable_Service } from "../service/Reusable_Service/Reusable_Service";
import {
  clearTokenRefresh,
  setupTokenRefresh,
} from "../utils/SetupRefreshToken";

const submenue = localStorage.getItem("subdomain") || "default";

interface Category {
  _id: string;
  categoryname: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

interface Permission {
  module: string;
  canCreate: boolean;
  canRead: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface Company {
  _id?: string;
  companyName?: string;
  industry?: string;
  companySize?: string;
  address?: string;
  [key: string]: any;
}

interface UserData {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
  Profile?: string;
  address?: string | null;
  attendanceList?: any[];
  averageResponseTime?: number;
  company?: Company;
  createdAt?: string;
  createdBy?: string | null;
  customFields?: any[];
  dashboardSections?: any[];
  deleted?: boolean;
  firstLoginTime?: string;
  isDashboardTourCompleted?: boolean;
  isFirstLogin?: boolean;
  isLeadTourCompleted?: boolean;
  isPracticeDone?: boolean;
  otp?: string | null;
  otpExpires?: string | null;
  otpVerified?: boolean;
  permissions?: Permission[];
  responseCount?: number;
  status?: number;
  totalResponseTime?: number;
  updatedAt?: string;
  userRole?: string;
  [key: string]: any;
}

interface AuthState {
  user: UserData | null;
  token: string | null;
  mobile: string | null;
  isLoading: boolean;
  error: any;
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: any;
  permissions: Permission[];
  userRole: string | null;
  isAuthenticated: boolean;
  meData: UserData | null;
  meLoading: boolean;
  meError: any;
}

export const loginAPI = (data: { mobile: string }) =>
  Reusable_Service().post("/user/check-user/", data);

export const OtpAPI = (data: { mobile: string; otp: string }) =>
  Reusable_Service().post("/user/verify-otp/", data);

export const RegisterAPI = (data: any) =>
  axios.post("http://192.168.1.11:5000/api/v1/company/self-register", data);

export const getCategories = () =>
  axios.get("http://192.168.1.11:5000/api/v1/category/");

export const meAPI = () => Reusable_Service().get(`/user/${submenue}/me`);

export const notificationAPI = () =>
  Reusable_Service().get(`/activity/own/activity/${submenue}`);

export const refreshTokenAPI = (data: { refreshToken: string }) =>
  axios.post(`${import.meta.env.VITE_BASE_URL}/auth/refresh-token`, data);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data: { mobile: string }, { rejectWithValue }) => {
    try {
      const response = await loginAPI(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const OtpUser = createAsyncThunk(
  "auth/OtpUser",
  async (
    data: { mobile: string; otp: string },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const response = await OtpAPI(data);
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      if (accessToken && newRefreshToken) {
        setTimeout(() => {
          setupTokenRefresh(dispatch);
        }, 100);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const RegisterUser = createAsyncThunk(
  "auth/RegisterUser",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await RegisterAPI(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchCategories = createAsyncThunk<Category[]>(
  "auth/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCategories();
      return (
        response.data?.data?.map((cat: any) => ({
          _id: cat._id,
          categoryname: cat.categoryname,
          status: cat.status,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
          createdBy: cat.createdBy,
        })) || []
      );
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// New thunk to fetch meAPI data
export const fetchMeData = createAsyncThunk(
  "auth/fetchMeData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await meAPI();
      console.log("meAPI Response:", response);
      
      // Extract user data from response
      const userData = response.data?.data || response.data;
      
      // Store permissions in localStorage for easy access
      if (userData?.permissions) {
        localStorage.setItem("userPermissions", JSON.stringify(userData.permissions));
      }
      
      // Store user role
      if (userData?.userRole) {
        localStorage.setItem("userRole", userData.userRole);
      }
      
      // Store full user data
      localStorage.setItem("userData", JSON.stringify(userData));
      
      return userData;
    } catch (error: any) {
      console.error("Failed to fetch me data:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken");

      if (!refreshTokenValue) {
        throw new Error("No refresh token");
      }
      const response = await refreshTokenAPI({
        refreshToken: refreshTokenValue,
      });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      const expiryTime = Date.now() + 60 * 60 * 1000;
      localStorage.setItem("tokenExpiry", String(expiryTime));
      if (!localStorage.getItem("loginTimestamp")) {
        localStorage.setItem("loginTimestamp", String(Date.now()));
      }
      setTimeout(() => {
        setupTokenRefresh(dispatch);
      }, 100);

      return response.data;
    } catch (error: any) {
      console.error("❌ Token refresh failed:", error);
      localStorage.clear();
      dispatch(logout());
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Try to load initial state from localStorage
const loadInitialState = (): Partial<AuthState> => {
  const storedUserData = localStorage.getItem("userData");
  const storedPermissions = localStorage.getItem("userPermissions");
  const storedUserRole = localStorage.getItem("userRole");
  
  return {
    user: storedUserData ? JSON.parse(storedUserData) : null,
    permissions: storedPermissions ? JSON.parse(storedPermissions) : [],
    userRole: storedUserRole || null,
    token: localStorage.getItem("accessToken") || null,
    mobile: localStorage.getItem("mobile") || null,
  };
};

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("accessToken") || null,
  mobile: null,
  isLoading: false,
  error: null,
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  permissions: [],
  userRole: null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
  meData: null,
  meLoading: false,
  meError: null,
  ...loadInitialState(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.mobile = null;
      state.categories = [];
      state.permissions = [];
      state.userRole = null;
      state.isAuthenticated = false;
      state.meData = null;
      state.meError = null;
      clearTokenRefresh();
      localStorage.clear();
    },
    clearError: (state) => {
      state.error = null;
      state.meError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mobile = action.meta.arg.mobile;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(OtpUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(OtpUser.fulfilled, (state, action) => {
        state.isLoading = false;

        const {
          user,
          accessToken,
          refreshToken: newRefreshToken,
        } = action.payload;

        state.user = user;
        state.token = accessToken;
        state.isAuthenticated = true;
        
        // Store permissions if available
        if (user?.permissions) {
          state.permissions = user.permissions;
        }
        
        // Store user role if available
        if (user?.userRole) {
          state.userRole = user.userRole;
        }
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        const expiryTime = Date.now() + 60 * 60 * 1000;
        localStorage.setItem("tokenExpiry", String(expiryTime));
        localStorage.setItem("loginTimestamp", String(Date.now()));
      })
      .addCase(OtpUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(RegisterUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(RegisterUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(RegisterUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload;
      })

      // Handle fetchMeData
      .addCase(fetchMeData.pending, (state) => {
        state.meLoading = true;
        state.meError = null;
      })
      .addCase(fetchMeData.fulfilled, (state, action) => {
        state.meLoading = false;
        state.meData = action.payload;
        state.user = action.payload;
        
        // Update permissions and role
        if (action.payload?.permissions) {
          state.permissions = action.payload.permissions;
        }
        if (action.payload?.userRole) {
          state.userRole = action.payload.userRole;
        }
        
        state.isAuthenticated = true;
      })
      .addCase(fetchMeData.rejected, (state, action) => {
        state.meLoading = false;
        state.meError = action.payload;
      })

      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.accessToken;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.permissions = [];
        state.userRole = null;
        state.isAuthenticated = false;
        localStorage.clear();
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;