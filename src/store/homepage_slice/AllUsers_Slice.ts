import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Reusable_Service } from "../../service/Reusable_Service/Reusable_Service";


interface CustomerState {
  AllUsersTableData: any; // Replace with proper type if you have one
  loading: boolean;
  error: string | null;
}


const initialState: CustomerState = {
  AllUsersTableData: null,
  loading: false,
  error: null,
};

export const  Permissions_getall_User = async () => {
    return Reusable_Service().get(`/roleandpermission/${localStorage.getItem("subdomain")}/all-roles-permissions`)
}

export const  create_User = async (payload : any) => {
    return Reusable_Service().post(`/user/${localStorage.getItem("subdomain")}/adduser`, payload)
}

export const  Edit_User = async (id : number,payload : any) => {
    return Reusable_Service().patch(`/user/${localStorage.getItem("subdomain")}/${id}`, payload)
}
export const  Delete_User = async (id : number,payload : any) => {
    return Reusable_Service().delete(`/user/${localStorage.getItem("subdomain")}?userIds=${id}`, payload)
}

export const fetchAllUsersTableData = createAsyncThunk(
  "customer/fetchAllUsersTableData",
  async (_, { rejectWithValue }) => {
    try {
      const subdomain = localStorage.getItem("subdomain");

      const response = await Reusable_Service().get(
        `/user/${subdomain}/`
      );
      return response?.data;
    

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
    clearAllUsersTableData: (state) => {
      state.AllUsersTableData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsersTableData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllUsersTableData.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.AllUsersTableData = action.payload;
        }
      )
      .addCase(fetchAllUsersTableData.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { clearAllUsersTableData } = customerSlice.actions;

export default customerSlice.reducer;