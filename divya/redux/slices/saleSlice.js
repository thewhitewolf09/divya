import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Helper function to get the token
const getToken = (state) => state.user.token;

// Add a new sale
export const addNewSale = createAsyncThunk(
  "sales/addNewSale",
  async (saleData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post("/api/sales/add", saleData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.sales;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Update a sale
export const updateSale = createAsyncThunk(
  "sales/updateSale",
  async ({ id, saleData }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.put(`/api/sales/${id}`, saleData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.sale;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Delete a sale
export const deleteSale = createAsyncThunk(
  "sales/deleteSale",
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.delete(`/api/sales/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data)
      return id;
    } catch (error) {
      console.error(error)
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Fetch monthly sales
export const getAllSales = createAsyncThunk(
  "sales/getAllSales",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/sales/all");
      return response.data.sales;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Fetch sales by date range
export const getSalesByDateRange = createAsyncThunk(
  "sales/getSalesByDateRange",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/sales/range", {
        params: { startDate, endDate },
      });
      return response.data.sales;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Fetch sales by product category
export const getSalesByProductCategory = createAsyncThunk(
  "sales/getSalesByProductCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/sales/category/${categoryId}`);
      return response.data.sales;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Fetch top-selling products
export const getTopSellingProducts = createAsyncThunk(
  "sales/getTopSellingProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/sales/top-products");
      return response.data.products;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Fetch monthly sales
export const getMonthlySales = createAsyncThunk(
  "sales/getMonthlySales",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/sales/monthly");
      return response.data.sales;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Fetch credit sales
export const getCreditSales = createAsyncThunk(
  "sales/getCreditSales",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/sales/credit");
      return response.data.sales;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Fetch customer sales by customer ID
export const getCustomerSales = createAsyncThunk(
  "sales/getCustomerSales",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/sales/customer/${customerId}`);
      return response.data.sales;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Fetch product sales report
export const getProductSalesReport = createAsyncThunk(
  "sales/getProductSalesReport",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/sales/product/${productId}`);
      return response.data.report;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Fetch sales summary
export const getSalesSummary = createAsyncThunk(
  "sales/getSalesSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/sales/summary");
      return response.data.summary;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Fetch outstanding credit
export const getOutstandingCredit = createAsyncThunk(
  "sales/getOutstandingCredit",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/sales/credit/outstanding");
      return response.data.outstandingCredit;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);



// Sale slice
const saleSlice = createSlice({
  name: "sales",
  initialState: {
    sales: [],
    sale: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSaleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add new sale
      .addCase(addNewSale.pending, (state) => {
        state.loading = true;
      })
      .addCase(addNewSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(addNewSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update sale
      .addCase(updateSale.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSale.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sales.findIndex(
          (sale) => sale._id === action.payload._id
        );
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
      })
      .addCase(updateSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete sale
      .addCase(deleteSale.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = state.sales.filter((sale) => sale._id !== action.payload);
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All sales
      .addCase(getAllSales.pending,(state)=>{
        state.loading = true;
      })
      .addCase(getAllSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(getAllSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch sales by date range
      .addCase(getSalesByDateRange.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSalesByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(getSalesByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch sales by product category
      .addCase(getSalesByProductCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSalesByProductCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(getSalesByProductCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch top-selling products
      .addCase(getTopSellingProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTopSellingProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.topProducts = action.payload;
      })
      .addCase(getTopSellingProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch monthly sales
      .addCase(getMonthlySales.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMonthlySales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(getMonthlySales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch credit sales
      .addCase(getCreditSales.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCreditSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(getCreditSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch customer sales by customer ID
      .addCase(getCustomerSales.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCustomerSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(getCustomerSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch product sales report
      .addCase(getProductSalesReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.productSalesReport = action.payload;
      })
      .addCase(getProductSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch sales summary
      .addCase(getSalesSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSalesSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.salesSummary = action.payload;
      })
      .addCase(getSalesSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch outstanding credit
      .addCase(getOutstandingCredit.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOutstandingCredit.fulfilled, (state, action) => {
        state.loading = false;
        state.outstandingCredit = action.payload;
      })
      .addCase(getOutstandingCredit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSaleError } = saleSlice.actions;

export default saleSlice.reducer;
