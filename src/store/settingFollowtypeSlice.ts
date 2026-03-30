import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "../api/fetch";

interface FollowUpType {
  _id: string;
  typeName: string;
}

interface FollowUpTypeState {
  types: FollowUpType[];
  loading: boolean;
  createLoading: boolean;
  deleteLoading: boolean;
  error: string | null;
  message: string | null;
  deleteMessage: string | null;
  deleteError: string | null;
}

let slugname: string = "emayam-technology";

export const createFollowUpType = createAsyncThunk<
  { message: string; data?: FollowUpType },
  { typeName: string },
  { rejectValue: string }
>("followUpType/create", async (body, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadfollowuptype/${slugname}`,
      method: "POST",
      body,
    });
    return {
      message: response?.message || "Created successfully",
      data: response?.data,
    };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.message || "Failed to create follow-up type",
    );
  }
});

export const updateFollowUpType = createAsyncThunk<
  { id: string; message: string },
  { id: string; typeName: string },
  { rejectValue: string }
>("followUpType/update", async ({ id, typeName }, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadfollowuptype/${slugname}/${id}`,
      method: "PATCH",
      body: { typeName },
    });
    return {
      id,
      message: response?.message || "Updated successfully",
    };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Update failed");
  }
});

export const getFollowUpTypes = createAsyncThunk<
  FollowUpType[],
  void,
  { rejectValue: string }
>("followUpType/getAll", async (_, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadfollowuptype/${slugname}`,
      method: "GET",
    });
    return response?.data || response || [];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.message || "Failed to fetch follow-up types",
    );
  }
});

export const deleteFollowUpType = createAsyncThunk<
  { id: string; message: string },
  string,
  { rejectValue: string }
>("followUpType/delete", async (id, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/leadfollowuptype/${slugname}/${id}`,
      method: "DELETE",
    });
    return response;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.message || "Failed to delete follow-up type",
    );
  }
});

const initialState: FollowUpTypeState = {
  types: [],
  loading: false,
  deleteLoading: false,
  error: null,
  message: null,
  createLoading: false,
  deleteMessage: null,
  deleteError: null,
};

const followUpTypeSlice = createSlice({
  name: "followUpType",
  initialState,

  reducers: {
    clearFollowUpMessage(state) {
      state.message = null;
      state.deleteMessage = null;
    },
    clearFollowUpError(state) {
      state.error = null;
      state.deleteError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createFollowUpType.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createFollowUpType.fulfilled, (state, action) => {
        state.createLoading = false;
        state.message = action.payload.message;
      })
      .addCase(createFollowUpType.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || "Something went wrong";
      })

      .addCase(updateFollowUpType.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFollowUpType.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(updateFollowUpType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

      .addCase(getFollowUpTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFollowUpTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.types = action.payload;
      })
      .addCase(getFollowUpTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

      .addCase(deleteFollowUpType.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteFollowUpType.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message || "Deleted successfully";
      })
      .addCase(deleteFollowUpType.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Delete failed";
      });
  },
});

export const { clearFollowUpMessage, clearFollowUpError } =
  followUpTypeSlice.actions;

export default followUpTypeSlice.reducer;
