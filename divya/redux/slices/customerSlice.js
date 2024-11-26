import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Helper function to get the token
const getToken = (state) => state.user.token;

// Fetch all customers
// Fetch all customers
export const fetchAllCustomers = createAsyncThunk(
  "customers/fetchAll",
  async (args = {}, { rejectWithValue }) => {
    // Provide default values if args is empty
    const { filters = {}, sort = null } = args;


    try {
      // Construct query parameters dynamically
      const queryParams = new URLSearchParams({
        ...filters,
        ...(sort && { sort }),
      }).toString();

    

      // Make the API request with query parameters
      const response = await api.get(`/api/customers/all?${queryParams}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Fetch single customer by ID
export const fetchCustomerDetails = createAsyncThunk(
  "customers/fetchDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/customers/${id}`);
      return response.data.customer;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Create a new customer
export const createCustomer = createAsyncThunk(
  "customers/create",
  async (customerData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post("/api/customers/add", customerData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.customer;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Update customer details
export const updateCustomer = createAsyncThunk(
  "customers/update",
  async ({ id, customerData }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.put(`/api/customers/${id}`, customerData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.customer;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Delete a customer
export const deleteCustomer = createAsyncThunk(
  "customers/delete",
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      await api.delete(`/api/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id; // Return the ID of the deleted customer
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Filter customers by credit balance
export const filterCustomersByCreditBalance = createAsyncThunk(
  "customers/filterByCreditBalance",
  async (amount, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/customers/filter/credit-balance`, {
        params: { amount },
      });
      return response.data.customers;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Filter customers by date range
export const filterCustomersByDateRange = createAsyncThunk(
  "customers/filterByDateRange",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/customers/filter/date-range", {
        params: { startDate, endDate },
      });
      return response.data.customers;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Filter customers by membership status
export const filterCustomersByMembershipStatus = createAsyncThunk(
  "customers/filterByMembershipStatus",
  async (status, { rejectWithValue }) => {
    try {
      const response = await api.get(
        "/api/customers/filter/membership-status",
        { params: { status } }
      );
      return response.data.customers;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Filter customers by total purchases
export const filterCustomersByTotalPurchases = createAsyncThunk(
  "customers/filterByTotalPurchases",
  async (amount, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/customers/filter/total-purchases", {
        params: { amount },
      });
      return response.data.customers;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Search customers by name
export const searchCustomersByName = createAsyncThunk(
  "customers/search",
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/customers/search?q=${query}`);
      return response.data.customers;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get outstanding credit for a customer
export const getOutstandingCredit = createAsyncThunk(
  "customers/getOutstandingCredit",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/customers/${id}/credit/outstanding`);
      return response.data.outstandingCredit;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch customer membership summary
export const fetchMembershipSummary = createAsyncThunk(
  "membership/fetchSummary",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/customers/${id}/membership-summary`);
      return response.data.membershipSummary;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update membership status
export const updateMembershipStatus = createAsyncThunk(
  "membership/updateStatus",
  async ({ id, status }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.patch(
        `/api/customers/${id}/membership`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.updatedMembership;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch daily item attendance
export const fetchDailyItemAttendance = createAsyncThunk(
  "membership/fetchDailyItemAttendance",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/customers/${id}/daily-items/attendance`
      );
      return response.data.attendance;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Record daily item attendance
export const recordDailyItemAttendance = createAsyncThunk(
  "membership/recordDailyItemAttendance",
  async ({ id, itemName, date, quantity }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.post(
        `/api/customers/${id}/daily-items/${itemName}/attendance`,
        { date, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.customer;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Update daily item quantity
export const updateDailyItemQuantity = createAsyncThunk(
  "membership/updateDailyItemQuantity",
  async ({ id, itemName, quantity }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.post(
        `/api/customers/${id}/daily-items/${itemName}/quantity`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.customer;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Add daily item for customer
export const addDailyItemForCustomer = createAsyncThunk(
  "membership/addDailyItem",
  async ({ id, itemName, quantityPerDay }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.post(
        `/api/customers/${id}/daily-items`,
        { itemName, quantityPerDay },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.customer;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Remove daily item for customer
export const removeDailyItemForCustomer = createAsyncThunk(
  "membership/removeDailyItem",
  async ({ id, itemName }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.delete(
        `/api/customers/${id}/daily-items/${itemName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.customer;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Update credits of Customer
export const updateCreditsOfCustomer = createAsyncThunk(
  "sales/updateCreditsOfCustomer",
  async ({ customerId, paymentData }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.patch(
        `/api/customers/credit/${customerId}/payment`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.customer;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Slice
const customerSlice = createSlice({
  name: "customers",
  initialState: {
    customers: [],
    customer: null,
    totalCustomers: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all customers
      .addCase(fetchAllCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllCustomers.fulfilled, (state, action) => {
        state.customers = action.payload.customers;
        state.totalCustomers = action.payload.totalCustomers;
        state.loading = false;
      })
      .addCase(fetchAllCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single customer
      .addCase(fetchCustomerDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomerDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
      })
      .addCase(fetchCustomerDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.push(action.payload);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update customer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
        const index = state.customers.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.customers[index] = action.payload; // Update the customer in the list
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(
          (customer) => customer._id !== action.payload
        );
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Filter customers by credit balance
      .addCase(filterCustomersByCreditBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(filterCustomersByCreditBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(filterCustomersByCreditBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Filter customers by date range
      .addCase(filterCustomersByDateRange.pending, (state) => {
        state.loading = true;
      })
      .addCase(filterCustomersByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(filterCustomersByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Filter customers by membership status
      .addCase(filterCustomersByMembershipStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(filterCustomersByMembershipStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(filterCustomersByMembershipStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Filter customers by total purchases
      .addCase(filterCustomersByTotalPurchases.pending, (state) => {
        state.loading = true;
      })
      .addCase(filterCustomersByTotalPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(filterCustomersByTotalPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search customers by name
      .addCase(searchCustomersByName.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchCustomersByName.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(searchCustomersByName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get outstanding credit
      .addCase(getOutstandingCredit.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOutstandingCredit.fulfilled, (state, action) => {
        state.loading = false;
        // Store outstanding credit in state if needed
      })
      .addCase(getOutstandingCredit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch membership summary
      .addCase(fetchMembershipSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMembershipSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.membershipSummary = action.payload;
      })
      .addCase(fetchMembershipSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update membership status
      .addCase(updateMembershipStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMembershipStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.customer.membershipStatus = action.payload.status;
      })
      .addCase(updateMembershipStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch daily item attendance
      .addCase(fetchDailyItemAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDailyItemAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyItems = action.payload;
      })
      .addCase(fetchDailyItemAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Record daily item attendance
      .addCase(recordDailyItemAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(recordDailyItemAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
        const updatedCustomerIndex = state.customers.findIndex(
          (customer) => customer._id === action.payload._id
        );
        if (updatedCustomerIndex !== -1) {
          state.customers[updatedCustomerIndex] = action.payload;
        } else {
          state.customers.push(action.payload);
        }
      })
      .addCase(recordDailyItemAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update daily item quantity
      .addCase(updateDailyItemQuantity.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDailyItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
      })
      .addCase(updateDailyItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add daily item for customer
      .addCase(addDailyItemForCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(addDailyItemForCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
      })
      .addCase(addDailyItemForCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove daily item for customer
      .addCase(removeDailyItemForCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeDailyItemForCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
      })
      .addCase(removeDailyItemForCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update credit sale payment
      .addCase(updateCreditsOfCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCreditsOfCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;

        const updatedCustomerIndex = state.customers.findIndex(
          (customer) => customer._id === action.payload._id
        );
        if (updatedCustomerIndex !== -1) {
          state.customers[updatedCustomerIndex] = action.payload;
        } else {
          state.customers.push(action.payload);
        }
      })
      .addCase(updateCreditsOfCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { clearError } = customerSlice.actions;

// Export the reducer
export default customerSlice.reducer;
