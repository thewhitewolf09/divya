import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

const getToken = (state) => state.user.token;

// Async Thunk for user signup
export const signupUser = createAsyncThunk(
  "user/signup",
  async ({ signUpData, deviceToken }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/users/register", {
        ...signUpData,
        deviceToken,
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage); // Handle errors
    }
  }
);

// Async Thunk for user login (signIn)
export const loginUser = createAsyncThunk(
  "user/login",
  async ({ mobile, deviceToken }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/users/login", {
        mobile,
        deviceToken,
      });
      return response; // Response from the login API
    } catch (error) {
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

// Async Thunk for fetching a user by ID
export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (userId, { rejectWithValue }) => {
    console.log(userId);
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data.user;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.response.data.resultMessage); // Handle errors
    }
  }
);

// Async Thunk for updating a user by ID
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ userId, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/users/${userId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage); // Handle errors
    }
  }
);

// Async Thunk for updating shop timings
export const updateShopTimings = createAsyncThunk(
  "user/updateShopTimings",
  async ({ userId, shopTimings }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.patch(
        `/api/users/${userId}/shop-timing`,
        shopTimings,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.user;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.response.data.resultMessage); // Handle errors
    }
  }
);

// Async Thunk for deleting a user by ID
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/users/${userId}`);
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
      })

      // Fetch User actions
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update User actions
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Shop Timings actions
      .addCase(updateShopTimings.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateShopTimings.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateShopTimings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete User actions
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.verified = false;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { logout } = userSlice.actions;
export default userSlice.reducer;
