import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Reusable_Service } from "../../service/Reusable_Service/Reusable_Service";

// Helper to get subdomain safely from storage
const getSubdomain = () => localStorage.getItem("subdomain") || "default";

/**
 * Interface for Dashboard Layout
 * Matches backend requirement: { id, size, sections }
 */
export interface DashboardSection {
  id: string;       // Unique ID for Drag & Drop (e.g., "row_1")
  size: number;     // Grid span (6 for half width, 12 for full)
  sections: string; // The Component Name (e.g., "Recent_Leads")
}

interface DashboardState {
  stats: any;
  leadAcquisition: any;
  recentLeads: any;
  upcomingFollowUps: any;
  highValueLeads: any;
  sections: DashboardSection[];
  isLoading: boolean;
  chartLoading: boolean; 
  error: any;
  lastFetched: number | null;
}

/**
 * Default Layout 
 * Sent to backend if the user hasn't saved a custom order yet.
 */
const defaultSections: DashboardSection[] = [
  { id: "sec_1", size: 12, sections: "Dashboard_Stats" },
  { id: "sec_2", size: 12, sections: "LeadAcquisitionChart" },
  { id: "sec_3", size: 6,  sections: "Upcomming_FollowU" },
  { id: "sec_4", size: 6,  sections: "High_Leads" },
  { id: "sec_5", size: 12, sections: "Recent_Leads" },
];

/**
 * THUNK 1: Initial Dashboard Load
 * Fetches all 5 sections in parallel
 */
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    const subdomain = getSubdomain();
    try {
      const responses = await Promise.all([
        Reusable_Service().get(`/dashboard/${subdomain}/section1`), 
        Reusable_Service().get(`/dashboard/${subdomain}/section2?type=monthly`),
        Reusable_Service().get(`/dashboard/${subdomain}/section3`), 
        Reusable_Service().get(`/dashboard/${subdomain}/section4`), 
        Reusable_Service().get(`/dashboard/${subdomain}/section5`), 
      ]);

      return {
        stats: responses[0]?.data || null,
        leadAcquisition: responses[1]?.data || null,
        upcomingFollowUps: responses[2]?.data || null,
        recentLeads: responses[3]?.data || null,
        highValueLeads: responses[4]?.data || null,
      };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to load dashboard");
    }
  }
);

/**
 * THUNK 2: Filtered Chart Data
 */
export const fetchLeadAcquisition = createAsyncThunk(
  "dashboard/fetchLeadAcquisition",
  async (type: string, { rejectWithValue }) => {
    const subdomain = getSubdomain();
    try {
      const response = await Reusable_Service().get(`/dashboard/${subdomain}/section2?type=${type}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update chart");
    }
  }
);

export const saveDashboardLayout = createAsyncThunk(
  "dashboard/saveLayout",
  async (newSections: DashboardSection[], { rejectWithValue }) => {
    const subdomain = getSubdomain();
    try {
      await Reusable_Service().put(
        `/dashboard/${subdomain}/section`,
        {
          sections: newSections
        }
      );

      return newSections;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors || "Failed to save layout"
      );
    }
  }
);

const initialState: DashboardState = {
  stats: null,
  leadAcquisition: null,
  recentLeads: null,
  upcomingFollowUps: null,
  highValueLeads: null,
  sections: defaultSections,
  isLoading: false,
  chartLoading: false,
  error: null,
  lastFetched: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      Object.assign(state, initialState);
    },
    // Used for "Optimistic Updates" - changes UI immediately during drag
    updateLocalLayout: (state, action: PayloadAction<DashboardSection[]>) => {
      state.sections = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initial Load
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.leadAcquisition = action.payload.leadAcquisition;
        state.upcomingFollowUps = action.payload.upcomingFollowUps;
        state.recentLeads = action.payload.recentLeads;
        state.highValueLeads = action.payload.highValueLeads;
        
        // If the API returns a saved custom layout, use it.
        const savedLayout = action.payload.stats?.data?.dashboardSections;
        if (savedLayout && savedLayout.length > 0) {
            state.sections = savedLayout;
        }
        
        state.lastFetched = Date.now();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Chart Update
      .addCase(fetchLeadAcquisition.pending, (state) => {
        state.chartLoading = true;
      })
      .addCase(fetchLeadAcquisition.fulfilled, (state, action) => {
        state.chartLoading = false;
        state.leadAcquisition = action.payload;
      })

      // Save Layout
      .addCase(saveDashboardLayout.fulfilled, (state, action) => {
        state.sections = action.payload;
      })
      .addCase(saveDashboardLayout.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearDashboardData, updateLocalLayout } = dashboardSlice.actions;
export default dashboardSlice.reducer;