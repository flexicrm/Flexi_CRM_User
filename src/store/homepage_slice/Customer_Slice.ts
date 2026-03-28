import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Reusable_Service } from "../../service/Reusable_Service/Reusable_Service";


interface CustomerState {
  customerTableData: any; // Replace with proper type if you have one
  loading: boolean;
  error: string | null;
}


const initialState: CustomerState = {
  customerTableData: null,
  loading: false,
  error: null,
};


export const fetchCustomerTableData = createAsyncThunk(
  "customer/fetchCustomerTableData",
  async (_, { rejectWithValue }) => {
    try {
      const subdomain = localStorage.getItem("subdomain");

      const response = await Reusable_Service().get(
        `/customer/${subdomain}/`
      );

      return response.data.data;

    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch customer table data"
      );
    }
  }
);

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    clearCustomerTableData: (state) => {
      state.customerTableData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerTableData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCustomerTableData.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.customerTableData = action.payload;
        }
      )
      .addCase(fetchCustomerTableData.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { clearCustomerTableData } = customerSlice.actions;

export default customerSlice.reducer;