// store/homepage_slice/Profile_Slice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { Reusable_Service } from '../../service/Reusable_Service/Reusable_Service';

export interface UserData {
  firstname?: string;
  lastname?: string;
  email?: string;
  mobile?: string;
  profile?: string;
  Profile?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  company?: {
    firstname?: string;
    lastname?: string;
    email?: string;
    mobile?: string;
    companyName?: string;
    Admin?: {
      address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
      };
    };
  };
}

interface ProfileState {
  data: UserData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  isLoading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const api = Reusable_Service();
      const subdomain = localStorage.getItem('subdomain');
      const response = await api.get(`/user/${subdomain}/me`);
      return response.data.data.user || response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const api = Reusable_Service();
      const subdomain = localStorage.getItem('subdomain');
      const response = await api.patch(`/user/${subdomain}/me`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileData: (state, action: PayloadAction<UserData>) => {
      state.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setProfileData } = profileSlice.actions;
export default profileSlice.reducer;