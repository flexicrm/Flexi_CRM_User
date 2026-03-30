import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "../api/fetch";

interface LeadSource {
  _id: string;
  sourceName: string;
}

interface LeadSourceState {
  sources: LeadSource[];
  loading: boolean;
  createLoading: boolean;
  deleteLoading: boolean;
  error: string | null;
  message: string | null;
  deleteMessage: string | null;
  deleteError: string | null;
}

let slugname: string = "emayam-technology";

export const createLeadSource = createAsyncThunk<
  { message: string; data?: LeadSource },
  { sourceName: string },
  { rejectValue: string }
>("leadSource/create", async (body, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadsource/${slugname}`,
      method: "POST",
      body,
    });

    return {
      message: response?.message || "Created successfully",
      data: response?.data,
    };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Failed to create source");
  }
});

export const updateLeadSource = createAsyncThunk<
  { id: string; message: string },
  { id: string; sourceName: string },
  { rejectValue: string }
>("leadSource/update", async ({ id, sourceName }, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadsource/${slugname}/${id}`,
      method: "PATCH",
      body: { sourceName },
    });

    return {
      id,
      message: response?.message || "Updated successfully",
    };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Update failed");
  }
});

export const getLeadSource = createAsyncThunk<
  LeadSource[],
  void,
  { rejectValue: string }
>("leadSource/getAll", async (_, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadsource/${slugname}`,
      method: "GET",
    });

    return response?.data?.leadSources || response || [];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Failed to fetch source");
  }
});

export const deleteLeadSource = createAsyncThunk<
  { id: string; message: string },
  string,
  { rejectValue: string }
>("leadSource/delete", async (id, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadsource/${slugname}/${id}`,
      method: "DELETE",
    });

    return response;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Delete failed");
  }
});

const initialState: LeadSourceState = {
  sources: [],
  loading: false,
  createLoading: false,
  deleteLoading: false,
  error: null,
  message: null,
  deleteMessage: null,
  deleteError: null,
};

const settingleadSourceSlice = createSlice({
  name: "leadSource",
  initialState,
  reducers: {
    clearSourceMessage(state) {
      state.message = null;
      state.deleteMessage = null;
    },
    clearSourceError(state) {
      state.error = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createLeadSource.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createLeadSource.fulfilled, (state, action) => {
        state.createLoading = false;
        state.message = action.payload.message;
      })
      .addCase(createLeadSource.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || "Error";
      })

      .addCase(updateLeadSource.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateLeadSource.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(updateLeadSource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error";
      })

      .addCase(getLeadSource.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLeadSource.fulfilled, (state, action) => {
        state.loading = false;
        state.sources = action.payload;
      })
      .addCase(getLeadSource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error";
      })
      .addCase(deleteLeadSource.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteLeadSource.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message;
      })
      .addCase(deleteLeadSource.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Error";
      });
  },
});

export const { clearSourceMessage, clearSourceError } =
  settingleadSourceSlice.actions;

export default settingleadSourceSlice.reducer;
