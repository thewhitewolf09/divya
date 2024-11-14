import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Helper function to get the token
const getToken = (state) => state.user.token;

// Initiate Payment
export const initiatePayment = createAsyncThunk(
  "payment/initiatePayment",
  async (paymentData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post(`/api/payments/initiate`, paymentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data)
      return response.data; // Return both payment and order details
    } catch (error) {
      console.error(error)
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Handle Payment Callback
export const paymentCallback = createAsyncThunk(
  "payment/paymentCallback",
  async (callbackData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post(`/api/payments/callback`, callbackData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.status;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Get Payment History
export const getPaymentHistory = createAsyncThunk(
  "payment/getPaymentHistory",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.get(`/api/payments/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.history; // Return payment history
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Get Payment Receipt
export const getPaymentReceipt = createAsyncThunk(
  "payment/getPaymentReceipt",
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/payments/receipt/${transactionId}`);
      return response.data.receipt; // Return payment receipt
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Payment and Order slice
const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    payments: [],   // List of all payments (history)
    payment: null,  // Single payment details for current transaction
    order: null,    // Order details related to payment
    receipt: null,  // Payment receipt
    loading: false, // Loading state
    error: null,    // Error state
  },
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearOrderData: (state) => {
      state.order = null; // Clear order state when needed
    },
    clearPaymentData: (state) => {
      state.payment = null; // Clear payment state when needed
    },
  },
  extraReducers: (builder) => {
    // Initiate Payment
    builder
      .addCase(initiatePayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payment = action.payload.payment; // Set payment details
        state.order = action.payload.order; // Set order details
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle Payment Callback
      .addCase(paymentCallback.pending, (state) => {
        state.loading = true;
      })
      .addCase(paymentCallback.fulfilled, (state) => {
        state.loading = false;
        // Update payment status if necessary
      })
      .addCase(paymentCallback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Payment History
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload; // Set payment history
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Payment Receipt
      .addCase(getPaymentReceipt.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPaymentReceipt.fulfilled, (state, action) => {
        state.loading = false;
        state.receipt = action.payload; // Set payment receipt
      })
      .addCase(getPaymentReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentError, clearOrderData, clearPaymentData } = paymentSlice.actions;

export default paymentSlice.reducer;
