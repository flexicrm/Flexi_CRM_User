import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { Reusable_Service } from "../service/Reusable_Service/Reusable_Service";
import { clearTokenRefresh, setupTokenRefresh } from "../utils/SetupRefreshToken";

const submenue = localStorage.getItem("subdomain") || "default";

// ----------------------
// ✅ TYPES
// ----------------------
interface Category {
  _id: string;
  categoryname: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

interface AuthState {
  user: any | null;
  token: string | null;
  mobile: string | null;
  isLoading: boolean;
  error: any;
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: any;
}

// ----------------------
// ✅ API CALLS
// ----------------------
export const loginAPI = (data: { mobile: string }) =>
  Reusable_Service().post("/user/check-user/", data);

export const OtpAPI = (data: { mobile: string; otp: string }) =>
  Reusable_Service().post("/user/verify-otp/", data);

export const RegisterAPI = (data: any) =>
  axios.post("http://192.168.1.11:5000/api/v1/company/self-register", data);

export const getCategories = () =>
  axios.get("http://192.168.1.11:5000/api/v1/category/");

export const meAPI = () =>
  Reusable_Service().get(`/user/${submenue}/me`);

export const notificationAPI = () =>
  Reusable_Service().get(`/activity/own/activity/${submenue}`);

export const refreshTokenAPI = (data: { refreshToken: string }) =>
  axios.post(`${import.meta.env.VITE_BASE_URL}/auth/refresh-token`, data);

// ----------------------
// ✅ THUNKS
// ----------------------
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data: { mobile: string }, { rejectWithValue }) => {
    try {
      const response = await loginAPI(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const OtpUser = createAsyncThunk(
  "auth/OtpUser",
  async (
    data: { mobile: string; otp: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await OtpAPI(data);
      
      // After successful OTP verification, setup token refresh every 50 minutes
      const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
      
      if (accessToken && newRefreshToken) {
        // Setup automatic token refresh (every 50 minutes)
        setTimeout(() => {
          setupTokenRefresh(dispatch);
        }, 100);
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
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
  }
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
  }
);

// 🔥 REFRESH TOKEN THUNK - Refreshes every 50 minutes
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken");

      if (!refreshTokenValue) {
        throw new Error("No refresh token");
      }

      console.log("🔄 Refreshing token (50-minute cycle)");
      
      const response = await refreshTokenAPI({ refreshToken: refreshTokenValue });

      const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;

      // Save new tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      
      // Update token expiry (assuming 1 hour validity from now)
      const expiryTime = Date.now() + (60 * 60 * 1000); // 1 hour from now
      localStorage.setItem("tokenExpiry", String(expiryTime));
      
      // Keep login timestamp (for 7-day check)
      if (!localStorage.getItem("loginTimestamp")) {
        localStorage.setItem("loginTimestamp", String(Date.now()));
      }

      // Setup next token refresh (will happen again in 50 minutes)
      setTimeout(() => {
        setupTokenRefresh(dispatch);
      }, 100);

      console.log("✅ Token refreshed successfully");
      console.log(`📅 Next refresh in 50 minutes`);

      return response.data;
    } catch (error: any) {
      console.error("❌ Token refresh failed:", error);
      // Clear everything on refresh failure
      localStorage.clear();
      dispatch(logout());
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ----------------------
// ✅ INITIAL STATE
// ----------------------
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("accessToken") || null,
  mobile: null,
  isLoading: false,
  error: null,
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
};

// ----------------------
// ✅ SLICE
// ----------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.mobile = null;
      state.categories = [];

      // Clear token refresh timeout
      clearTokenRefresh();
      
      // Clear all localStorage
      localStorage.clear();
      
      console.log("👋 User logged out, tokens cleared");
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------------- LOGIN ----------------
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

      // ---------------- OTP ----------------
      .addCase(OtpUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(OtpUser.fulfilled, (state, action) => {
        state.isLoading = false;

        const { user, accessToken, refreshToken: newRefreshToken } = action.payload;

        state.user = user;
        state.token = accessToken;

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        
        // Set token expiry to 1 hour from now
        const expiryTime = Date.now() + (60 * 60 * 1000); // 1 hour
        localStorage.setItem("tokenExpiry", String(expiryTime));
        
        // Set login timestamp for 7-day check
        localStorage.setItem("loginTimestamp", String(Date.now()));
        
        console.log("✅ OTP verified successfully");
        console.log("🔑 Token will refresh every 50 minutes");
        console.log("📅 Login valid for 7 days");
      })
      .addCase(OtpUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ---------------- REGISTER ----------------
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

      // ---------------- FETCH CATEGORIES ----------------
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

      // ---------------- REFRESH TOKEN ----------------
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.accessToken;
        console.log("🔄 Token refreshed successfully");
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        localStorage.clear();
        console.log("❌ Token refresh failed, logged out");
      });
  },
});

// ----------------------
// ✅ EXPORTS
// ----------------------
export const { logout } = authSlice.actions;
export default authSlice.reducer;