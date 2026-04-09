import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Reusable_Service } from "../../service/Reusable_Service/Reusable_Service";

/* ================= TYPES ================= */

interface Lead {
  _id: string;
  LeadId: string;
  manualData: {
    name: string;
    email: string;
    mobileNo: string;
    company: string;
    jobTitle?: string;
    website?: string;
  };
  leadstatus: {
    _id: string;
    statusName: string;
    color: string;
  };
  leadsource: string;
  createdAt: string;
  followUps?: any[];
  activityLogs?: any[];
  history?: any[];
}

interface LeadsState {
  leadsData: {
    leads: Lead[];
    leadsCount: number;
    statusCounts: any[];
  } | null;

  viewLead: Lead | null;

  // Follow-up Modal Data
  followUpStatuses: any[];
  followUpTypes: any[];
  followUpLeadStatuses: any[];
  assignToUsers: any[];

  statusOptions: any[];
  sourceOptions: any[];
  userOptions: any[];

  loading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isSubmittingFollowUp: boolean;
  error: string | null;
}

/* ================= INITIAL STATE ================= */

const initialState: LeadsState = {
  leadsData: null,
  viewLead: null,

  followUpStatuses: [],
  followUpTypes: [],
  followUpLeadStatuses: [],
  assignToUsers: [],

  statusOptions: [],
  sourceOptions: [],
  userOptions: [],

  loading: false,
  isCreating: false,
  isUpdating: false,
  isSubmittingFollowUp: false,
  error: null,
};

const getSubdomain = () => localStorage.getItem("subdomain") || "default";

/* ================= THUNKS ================= */

export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  async (_, { rejectWithValue }) => {
    try {
      const response = await Reusable_Service().get(`/lead/${getSubdomain()}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchStatuses = createAsyncThunk(
  "leads/fetchStatuses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Reusable_Service().get(`/leadstatus/${getSubdomain()}`);
      return res.data.data;
    } catch {
      return rejectWithValue("Error fetching statuses");
    }
  }
);

export const fetchSources = createAsyncThunk(
  "leads/fetchSources",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Reusable_Service().get(`/leadsource/${getSubdomain()}`);
      return res.data.data.leadSources;
    } catch {
      return rejectWithValue("Error fetching sources");
    }
  }
);

export const fetchUsers = createAsyncThunk(
  "leads/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Reusable_Service().get(`/user/${getSubdomain()}`);
      return res.data.data.users;
    } catch {
      return rejectWithValue("Error fetching users");
    }
  }
);

export const createLead = createAsyncThunk(
  "leads/createLead",
  async (formData: any, { rejectWithValue, dispatch }) => {
    try {
      const res = await Reusable_Service().post(
        `/lead/offline/${getSubdomain()}/addlead`,
        formData
      );
      dispatch(fetchLeads());
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors);
    }
  }
);

export const ImportLead = createAsyncThunk(
  "leads/ImportLead",
  async (formData: any, { rejectWithValue, dispatch }) => {
    try {
      const res = await Reusable_Service().post(
        `/lead/bulk/upload/${getSubdomain()}`,
        formData
      );
      dispatch(fetchLeads());
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors);
    }
  }
);

export const createCustomer = createAsyncThunk(
  "leads/createCustomer",
  async (formData: any, { rejectWithValue, dispatch }) => {
    try {
      const res = await Reusable_Service().post(
        `/customer/${getSubdomain()}/`,
        formData
      );
      dispatch(fetchLeads());
      return res.data;
    } catch (error: any) {
      console.error("Create customer error:", error);
      
      // Extract the error response
      const errorResponse = error.response?.data;
      
      // Handle the errors field from your API
      if (errorResponse?.errors) {
        return rejectWithValue({ errors: errorResponse.errors });
      }
      
      // Handle message field
      if (errorResponse?.message) {
        return rejectWithValue({ message: errorResponse.message });
      }
      
      // Handle duplicate key error
      if (error.message?.includes("E11000 duplicate key") || error.message?.includes("duplicate key error")) {
        return rejectWithValue({ 
          errors: "Customer with this email already exists" 
        });
      }
      
      return rejectWithValue({ 
        message: errorResponse?.message || error.message || "Failed to create customer" 
      });
    }
  }
);

export const convertCustomer = createAsyncThunk(
  "leads/convertCustomer",
  async (
    {
      subdomain,
      leadId,
      status,
    }: { subdomain: string; leadId: string; status: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await Reusable_Service().put(
        `/lead/converted/${subdomain}/${leadId}`, // ✅ correct API
        { leadstatus: status }
      );

      dispatch(fetchLeads());
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
  error?.response?.data?.errors || 
  error?.response?.data?.message || 
  "Conversion failed"
);
    }
  }
);

export const updateLead = createAsyncThunk(
  "leads/updateLead",
  async (
    { leadId, formData }: { leadId: string; formData: any },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await Reusable_Service().patch(
        `/lead/${getSubdomain()}/${leadId}`,
        formData
      );
      dispatch(fetchLeads());
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateLeadkanban = createAsyncThunk(
  "leads/updateLeadkanban",
  async (
    { leadId, formData }: { leadId: string; formData: any },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await Reusable_Service().patch(
        `/lead/update-lead-status/${getSubdomain()}/${leadId}`,
        formData
      );
      dispatch(fetchLeads());
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getViewPage = createAsyncThunk(
  "leads/getViewPage",
  async (tableId: string, { rejectWithValue }) => {
    try {
      const res = await Reusable_Service().get(
        `/lead/${getSubdomain()}/${tableId}`
      );
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || "Something went wrong");
    }
  }
);

/* === NEW: Create FollowUp Logic === */
export const createFollowUp = createAsyncThunk(
  "leads/createFollowUp",
  async (
    { tableId, data }: { tableId: string; data: any },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await Reusable_Service().patch(
        `/lead/${getSubdomain()}/${tableId}/followups`,
        data
      );
      // Refresh the lead view to show the new followup immediately
      dispatch(getViewPage(tableId));
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error creating follow-up");
    }
  }
);

export const UpdateFollowUp = createAsyncThunk(
  "leads/createFollowUp",
  async (
    { tableId, data, followID }: { tableId: string; data: any; followID : string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await Reusable_Service().patch(
        `/lead/${getSubdomain()}/${tableId}/followups/${followID}`,
        data
      );
      // Refresh the lead view to show the new followup immediately
      dispatch(getViewPage(tableId));
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error creating follow-up");
    }
  }
);





export const addFollowUp_status = createAsyncThunk(
  "leads/addFollowUpStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Reusable_Service().get(`/leadfollowupstatus/${getSubdomain()}/`);
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue("Error fetching follow-up status");
    }
  }
);

export const addFollowUp_type = createAsyncThunk(
  "leads/addFollowUpType",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Reusable_Service().get(`/leadfollowuptype/${getSubdomain()}/`);
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue("Error fetching follow-up types");
    }
  }
);

export const addFollowUp_Leadstatus = createAsyncThunk(
  "leads/addFollowUpLeadStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Reusable_Service().get(`/leadstatus/${getSubdomain()}/`);
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue("Error fetching lead statuses");
    }
  }
);

export const GETactivity = async (id: any) => {
  return Reusable_Service().get(`/activity/${getSubdomain()}/${id}`)

};


export const addFollowUp_Assignto = createAsyncThunk(
  "leads/addFollowUpAssignTo",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Reusable_Service().get(`/user/${getSubdomain()}/`);
      return res.data.data.users;
    } catch (error: any) {
      return rejectWithValue("Error fetching assignable users");
    }
  }
);

/* ================= SLICE ================= */

const Leads_Slice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    clearLeadsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Leads List
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leadsData = action.payload.data;
      })
      .addCase(fetchLeads.rejected, (state) => {
        state.loading = false;
      })

      // Dropdowns
      .addCase(fetchStatuses.fulfilled, (state, action) => {
        state.statusOptions = action.payload;
      })
      .addCase(fetchSources.fulfilled, (state, action) => {
        state.sourceOptions = action.payload;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.userOptions = action.payload;
      })

      // View Lead
      .addCase(getViewPage.pending, (state) => {
        state.loading = true;
      })
      .addCase(getViewPage.fulfilled, (state, action) => {
        state.loading = false;
        state.viewLead = action.payload?.lead || action.payload || null;
      })
      .addCase(getViewPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Follow-Ups creation
      .addCase(createFollowUp.pending, (state) => {
        state.isSubmittingFollowUp = true;
      })
      .addCase(createFollowUp.fulfilled, (state) => {
        state.isSubmittingFollowUp = false;
      })
      .addCase(createFollowUp.rejected, (state, action) => {
        state.isSubmittingFollowUp = false;
        state.error = action.payload as string;
      })

      // Dropdown mappings
      .addCase(addFollowUp_status.fulfilled, (state, action) => {
        state.followUpStatuses = action.payload || [];
      })
      .addCase(addFollowUp_type.fulfilled, (state, action) => {
        state.followUpTypes = action.payload || [];
      })
      .addCase(addFollowUp_Leadstatus.fulfilled, (state, action) => {
        state.followUpLeadStatuses = action.payload || [];
      })
      .addCase(addFollowUp_Assignto.fulfilled, (state, action) => {
        state.assignToUsers = action.payload || [];
      });
  },
});

export const { clearLeadsError } = Leads_Slice.actions;
export default Leads_Slice.reducer;