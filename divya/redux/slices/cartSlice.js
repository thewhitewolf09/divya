import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Helper function to get the token
const getToken = (state) => state.user.token;

// Create Cart
export const createCart = createAsyncThunk(
  "cart/createCart",
  async (customerId, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post(
        `/api/carts/create`,
        { customerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Get Cart
export const getCart = createAsyncThunk(
  "cart/getCart",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/carts/get-cart/${customerId}`);
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Add Item to Cart
export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async ({ customerId, item }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.post(
        `/api/carts/add-item/${customerId}`,
        item,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Remove Item from Cart
export const removeItemFromCart = createAsyncThunk(
  "cart/removeItemFromCart",
  async (
    { customerId, productId, variantId },
    { getState, rejectWithValue }
  ) => {
    const state = getState();
    const token = getToken(state);
    
    try {
      const response = await api.put(
        `/api/carts/remove-item/${customerId}/${productId}`,
        { variantId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Update Item Quantity
export const updateItemQuantity = createAsyncThunk(
  "cart/updateItemQuantity",
  async (
    { customerId, productId, quantity },
    { getState, rejectWithValue }
  ) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.put(
        `/api/carts/update-item/${customerId}/${productId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Clear Cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (customerId, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.put(
        `/api/carts/clear-cart/${customerId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.cart; // Return cleared cart
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Calculate Total
export const calculateTotal = createAsyncThunk(
  "cart/calculateTotal",
  async (customerId, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.put(
        `/api/carts/calculate-total/${customerId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.total; // Return calculated total
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Cart slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Cart
    builder
      .addCase(createCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(createCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Cart
      .addCase(getCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Item to Cart
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove Item from Cart
      .addCase(removeItemFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload; // Updated cart
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Item Quantity
      .addCase(updateItemQuantity.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload; // Updated cart
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload; // Cleared cart
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Calculate Total
      .addCase(calculateTotal.pending, (state) => {
        state.loading = true;
      })
      .addCase(calculateTotal.fulfilled, (state, action) => {
        state.loading = false;
        state.total = action.payload; // Set total
      })
      .addCase(calculateTotal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCartError } = cartSlice.actions;

export default cartSlice.reducer;
