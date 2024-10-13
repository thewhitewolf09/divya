import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Async Thunk for user signup
export const signupUser = createAsyncThunk(
  "user/signup",
  async (signUpData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/users/register", signUpData);
      console.log("response", response.data);
      return response;
    } catch (error) {
      console.error("error", error);
      return rejectWithValue(error.response.data.resultMessage); // Handle errors
    }
  }
);

// Async Thunk for user login (signIn)
export const loginUser = createAsyncThunk(
  "user/login",
  async (mobile, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/users/login", {
        mobile,
      });
      console.log(mobile);
      console.log(response);
      return response; // Response from the login API
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response.data.resultMessage); // Handle errors
    }
  }
);

// Async Thunk for sending OTP
export const sendOtpUser = createAsyncThunk(
  "user/sendOtp",
  async (mobile, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/users/send-otp", {
        mobile,
      });
      return response; // Response from send OTP API
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response.data.resultMessage); // Handle errors
    }
  }
);

// Async Thunk for verifying OTP
export const verifyOtpUser = createAsyncThunk(
  "user/verifyOtp",
  async ({ mobile, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/users/verify-otp", {
        mobile,
        otp,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage); // Handle errors
    }
  }
);

// Create the user slice with reducers and extra reducers for async actions
const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    token: null,
    otpSent: false,
    verified: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.verified = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup actions
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login actions
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

        console.log(action.payload);
      })

      // Send OTP actions
      .addCase(sendOtpUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendOtpUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOtpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify OTP actions
      .addCase(verifyOtpUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyOtpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.verified = true;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      })
      .addCase(verifyOtpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { logout } = userSlice.actions;
export default userSlice.reducer;
