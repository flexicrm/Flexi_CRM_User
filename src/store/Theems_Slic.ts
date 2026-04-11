import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Reusable_Service } from "../service/Reusable_Service/Reusable_Service";

// Define the state interface
interface ThemeState {
  primaryColor: string;
  darkMode: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state, pulling from localStorage if available
const initialState: ThemeState = {
  primaryColor: localStorage.getItem("appPrimaryColor") || "",
  darkMode: localStorage.getItem("appDarkMode") === "true",
  isLoading: false,
  error: null,
};

const getSubdomain = () => localStorage.getItem("subdomain") || "default";

// Async Thunk for the PATCH request
export const updateThemeSettings = createAsyncThunk(
  "theme/updateThemeSettings",
  async (payload: { primaryColor: string; darkMode: boolean }, { rejectWithValue }) => {
    try {
      const res = await Reusable_Service().patch(
        `/user/${getSubdomain()}/me/theme/`,
        payload
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update theme settings"
      );
    }
  }
);

// Async Thunk for toggling dark mode only
export const toggleDarkModeAndSave = createAsyncThunk(
  "theme/toggleDarkModeAndSave",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const currentDarkMode = state.theme.darkMode;
      const currentPrimaryColor = state.theme.primaryColor;

      const newDarkMode = !currentDarkMode;

      await Reusable_Service().patch(
        `/user/${getSubdomain()}/me/theme/`,
        {
          primaryColor: currentPrimaryColor,
          darkMode: newDarkMode,
        }
      );

      return {
        darkMode: newDarkMode,
        primaryColor: currentPrimaryColor,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle dark mode"
      );
    }
  }
);

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setLocalPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
      localStorage.setItem("appPrimaryColor", action.payload);
    },
    setLocalDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      localStorage.setItem("appDarkMode", String(action.payload));
      // Apply dark mode to document
      if (action.payload) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleDarkModeLocal: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem("appDarkMode", String(state.darkMode));
      // Apply dark mode to document
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateThemeSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateThemeSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        const { primaryColor, darkMode } = action.meta.arg;
        state.primaryColor = primaryColor;
        state.darkMode = darkMode;
        
        localStorage.setItem("appPrimaryColor", primaryColor);
        localStorage.setItem("appDarkMode", String(darkMode));
        
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      })
      .addCase(updateThemeSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Handle toggle dark mode API call
      .addCase(toggleDarkModeAndSave.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleDarkModeAndSave.fulfilled, (state, action) => {
        state.isLoading = false;
        state.darkMode = action.payload.darkMode;
        state.primaryColor = action.payload.primaryColor;
        
        localStorage.setItem("appDarkMode", String(action.payload.darkMode));
        
        if (action.payload.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      })
      .addCase(toggleDarkModeAndSave.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setLocalPrimaryColor, setLocalDarkMode, toggleDarkModeLocal } = themeSlice.actions;
export default themeSlice.reducer;