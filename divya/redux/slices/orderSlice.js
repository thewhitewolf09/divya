import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Helper function to get the token
const getToken = (state) => state.user.token;

// Create Order
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (orderData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post(`/api/orders/`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.order; // Return created order
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Get All Orders by Customer
export const getAllOrders = createAsyncThunk(
  "order/getAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/orders/all`);
      return response.data.orders; // Return all orders
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Get Order by Customer
export const getOrdersByCustomer = createAsyncThunk(
  "order/getOrdersByCustomer",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/orders/customer/${customerId}`);
      return response.data.orders; // Return specific order
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Get Order by Order Id
export const getOrderById = createAsyncThunk(
  "order/getOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/orders/order/${orderId}`);
      console.log(response.data)
      return response.data.order;
    } catch (error) {
      console.error(error)
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Cancel Order
export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async (orderId, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.put(
        `/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.order; // Return updated order
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Update Order Status
export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ orderId, status }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.put(
        `/api/orders/${orderId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.order; // Return updated order
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Order slice
const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    order: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Orders
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Order by Customer
      .addCase(getOrdersByCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrdersByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getOrdersByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Order by OrderId
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload; // Update the canceled order
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;

        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload; // Update the order
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderError } = orderSlice.actions;

export default orderSlice.reducer;
