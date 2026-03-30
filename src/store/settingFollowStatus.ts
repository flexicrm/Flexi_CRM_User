import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "../api/fetch";

interface FollowUpStatus {
  _id: string;
  StatusName: string;
  color: string;
}

interface FollowUpStatusState {
  status: FollowUpStatus[];
  loading: boolean;
  createLoading: boolean;
  deleteLoading: boolean;
  error: string | null;
  message: string | null;
  deleteMessage: string | null;
  deleteError: string | null;
}

let slugname: string = "emayam-technology";

export const createFollowUpStatus = createAsyncThunk<
  { message: string; data?: FollowUpStatus },
  { StatusName: string; color: string },
  { rejectValue: string }
>("followUpStatus/create", async (body, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadfollowupstatus/${slugname}`,
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

export const updateFollowUpStatus = createAsyncThunk<
  { id: string; message: string },
  { id: string; StatusName: string; color: string },
  { rejectValue: string }
>("followUpStatus/update", async ({ id, StatusName }, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadfollowupstatus/${slugname}/${id}`,
      method: "PATCH",
      body: { StatusName },
    });

    return {
      id,
      message: response?.message || "Updated successfully",
    };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Update failed");
  }
});

export const getFollowUpStatus = createAsyncThunk<
  FollowUpStatus[],
  void,
  { rejectValue: string }
>("followUpStatus/getAll", async (_, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadfollowupstatus/${slugname}`,
      method: "GET",
    });

    return response?.data || response || [];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Failed to fetch status");
  }
});

export const deleteFollowUpStatus = createAsyncThunk<
  { id: string; message: string },
  string,
  { rejectValue: string }
>("followUpStatus/delete", async (id, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadfollowupstatus/${slugname}/${id}`,
      method: "DELETE",
    });

    return response;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Failed to delete status");
  }
});

const initialState: FollowUpStatusState = {
  status: [],
  loading: false,
  createLoading: false,
  deleteLoading: false,
  error: null,
  message: null,
  deleteMessage: null,
  deleteError: null,
};

const settingFollowStatus = createSlice({
  name: "followUpStatus",
  initialState,

  reducers: {
    clearStatusMessage(state) {
      state.message = null;
      state.deleteMessage = null;
    },
    clearStatusError(state) {
      state.error = null;
      state.deleteError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createFollowUpStatus.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createFollowUpStatus.fulfilled, (state, action) => {
        state.createLoading = false;
        state.message = action.payload.message;
      })
      .addCase(createFollowUpStatus.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || "Something went wrong";
      })

      .addCase(updateFollowUpStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFollowUpStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(updateFollowUpStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

      .addCase(getFollowUpStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFollowUpStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload;
      })
      .addCase(getFollowUpStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

      .addCase(deleteFollowUpStatus.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteFollowUpStatus.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message || "Deleted successfully";
      })
      .addCase(deleteFollowUpStatus.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Delete failed";
      });
  },
});

export const { clearStatusMessage, clearStatusError } =
  settingFollowStatus.actions;

export default settingFollowStatus.reducer;
