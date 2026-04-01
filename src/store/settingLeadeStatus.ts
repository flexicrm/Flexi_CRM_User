import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "../api/fetch";

interface LeadStatus {
  _id: string;
  statusName: string;
  color: string;
}

interface LeadStatusState {
  status: LeadStatus[];
  loading: boolean;
  createLoading: boolean;
  deleteLoading: boolean;
  error: string | null;
  message: string | null;
  deleteMessage: string | null;
  deleteError: string | null;
}

let slugname: string = localStorage.getItem("subdomain") || "";


export const createLeadStatus = createAsyncThunk<
  { message: string; data?: LeadStatus },
  { statusName: string; color: string },
  { rejectValue: string }
>("leadStatus/create", async (body, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadstatus/${slugname}`,
      method: "POST",
      body,
    });

    return {
      message: response?.message || "Created successfully",
      data: response?.data,
    };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Failed to create status");
  }
});

export const updateLeadStatus = createAsyncThunk<
  { id: string; message: string },
  { id: string; statusName: string; color: string },
  { rejectValue: string }
>("leadStatus/update", async ({ id, statusName, color }, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadstatus/${slugname}/${id}`,
      method: "PATCH",
      body: { statusName, color },
    });

    return {
      id,
      message: response?.message || "Updated successfully",
    };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Update failed");
  }
});

export const getLeadStatus = createAsyncThunk<
  LeadStatus[],
  void,
  { rejectValue: string }
>("leadStatus/getAll", async (_, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadstatus/${slugname}`,
      method: "GET",
    });

    return response?.data || response || [];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Failed to fetch status");
  }
});

export const deleteLeadStatus = createAsyncThunk<
  { id: string; message: string },
  string,
  { rejectValue: string }
>("leadStatus/delete", async (id, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadstatus/${slugname}/${id}`,
      method: "DELETE",
    });

    return response;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Failed to delete status");
  }
});

const initialState: LeadStatusState = {
  status: [],
  loading: false,
  createLoading: false,
  deleteLoading: false,
  error: null,
  message: null,
  deleteMessage: null,
  deleteError: null,
};

const leadStatusSlice = createSlice({
  name: "leadStatus",
  initialState,
  reducers: {
    clearLeadStatusMessage(state) {
      state.message = null;
      state.deleteMessage = null;
    },
    clearLeadStatusError(state) {
      state.error = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createLeadStatus.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createLeadStatus.fulfilled, (state, action) => {
        state.createLoading = false;
        state.message = action.payload.message;
      })
      .addCase(createLeadStatus.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || "Something went wrong";
      })

      .addCase(updateLeadStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(updateLeadStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

      .addCase(getLeadStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLeadStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload;
      })
      .addCase(getLeadStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

      .addCase(deleteLeadStatus.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteLeadStatus.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message || "Deleted successfully";
      })
      .addCase(deleteLeadStatus.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Delete failed";
      });
  },
});

export const { clearLeadStatusMessage, clearLeadStatusError } =
  leadStatusSlice.actions;

export default leadStatusSlice.reducer;
