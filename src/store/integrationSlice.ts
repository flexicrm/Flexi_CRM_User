import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetch } from "../api/fetch";

interface Field {
  fieldName: string;
  fieldType: string;
}

interface IntegrationState {
  loading: boolean;
  error: string | null;
  message: string | null;
  generatedCode: string;
}

let slugname: string = localStorage.getItem("subdomain") || "";

export const createIntegration = createAsyncThunk<
  { message: string; integrationCode: string },
  {
    formName: string;
    fields: Field[];
    platform: string;
    integrationType: string;
  },
  { rejectValue: string }
>("integration/create", async (body, thunkAPI) => {
  try {
    const response = await fetch({
      endpoint: `/lead/${slugname}`,
      method: "POST",
      body,
    });

    return {
      message: response?.message || "Created successfully",
      integrationCode: response?.data?.integrationCode || "",
    };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.message || "Failed to create integration",
    );
  }
});

const initialState: IntegrationState = {
  loading: false,
  error: null,
  message: null,
  generatedCode: "",
};

const integrationSlice = createSlice({
  name: "integration",
  initialState,
  reducers: {
    clearIntegrationMessage(state) {
      state.message = null;
    },
    clearIntegrationError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createIntegration.pending, (state) => {
        state.loading = true;
      })
      .addCase(createIntegration.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;

        const formattedCode = action.payload.integrationCode
          ?.replace(/\\n/g, "\n")
          .replace(/\\'/g, "'")
          .replace(/\\"/g, '"')
          .replace(/ {2,}/g, " ")
          .trim();

        state.generatedCode = formattedCode;
      })
      .addCase(createIntegration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { clearIntegrationMessage, clearIntegrationError } =
  integrationSlice.actions;

export default integrationSlice.reducer;
