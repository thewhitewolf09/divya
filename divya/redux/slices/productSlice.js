import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Helper function to get the token
const getToken = (state) => state.user.token;

// Fetch all products
export const fetchAllProducts = createAsyncThunk(
  "products/fetchAll",
  async (args = {}, { rejectWithValue }) => {
    const { filters = {}, sort = null } = args; 

    try {
      const queryParams = new URLSearchParams({
        ...filters,
        ...(sort && { sort }),
      }).toString();
      const response = await api.get(`/api/products/all?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch single product by ID
export const fetchSingleProduct = createAsyncThunk(
  "products/fetchSingle",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/products/${id}`);

      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Search for products
export const searchProducts = createAsyncThunk(
  "products/search",
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/products/search?q=${query}`);
      return response.data.products;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch products by category
export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchByCategory",
  async (category, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/products/category/${category}`);
      return response.data.products;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Add a new product
export const addProduct = createAsyncThunk(
  "products/add",
  async (productData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.post("/api/products/add", productData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Update a product
export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, productData }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.put(`/api/products/${id}`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Delete a product
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.delete(`/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Manage product stock
export const manageProductStock = createAsyncThunk(
  "products/manageStock",
  async ({ id, stockData }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.patch(`/api/products/${id}/stock`, stockData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Add product variant
export const addProductVariant = createAsyncThunk(
  "products/addVariant",
  async (variantData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.post(
        `/api/products/${variantData.productId}/variants`,
        variantData.variant,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Update product variant
export const updateProductVariant = createAsyncThunk(
  "products/updateVariant",
  async ({ id, variantId, variantData }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.put(
        `/api/products/${id}/variants/${variantId}`,
        variantData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete product variant
export const deleteProductVariant = createAsyncThunk(
  "products/deleteVariant",
  async (variantData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.delete(
        `/api/products/${variantData.productId}/variants/${variantData.variantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Upload product image
export const uploadProductImage = createAsyncThunk(
  "products/uploadImage",
  async ({ id, imageData }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.post(`/api/products/${id}/image`, imageData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Toggle product status (active/inactive)
export const toggleProductStatus = createAsyncThunk(
  "products/toggleStatus",
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);
    try {
      const response = await api.patch(
        `/api/products/${id}/activate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Fetch discounted products
export const fetchDiscountedProducts = createAsyncThunk(
  "products/fetchDiscounted",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/products/discounted");
      return response.data.products;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch low stock products
export const fetchLowStockProducts = createAsyncThunk(
  "products/fetchLowStock",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/products/low-stock");
      return response.data.products;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch recently added products
export const fetchRecentlyAddedProducts = createAsyncThunk(
  "products/fetchRecentlyAdded",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/products/recent");
      return response.data.products;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Bulk update products
export const bulkUpdateProducts = createAsyncThunk(
  "products/bulkUpdate",
  async (updates, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state); // Get token from state
    try {
      const response = await api.patch("/api/products/bulk", updates, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Return the response data (successes and failures)
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Slice
const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    product: null,
    totalProducts: 0,
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
      // Fetch all products
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.products = action.payload.products;
        state.totalProducts = action.payload.totalProducts;
        state.loading = false;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single product
      .addCase(fetchSingleProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSingleProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchSingleProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add product
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload); // Add new product to the list
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index] = action.payload; // Update the product in the list
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (product) => product._id !== action.meta.arg
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Manage product stock
      .addCase(manageProductStock.pending, (state) => {
        state.loading = true;
      })
      .addCase(manageProductStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index] = action.payload; // Update the product stock
        }
      })
      .addCase(manageProductStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Upload product image
      .addCase(uploadProductImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadProductImage.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index].image = action.payload.image; // Update the product image
        }
      })
      .addCase(uploadProductImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add product variant
      .addCase(addProductVariant.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProductVariant.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index].variants.push(action.payload.variant); // Add new variant
        }
      })
      .addCase(addProductVariant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update product variant
      .addCase(updateProductVariant.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProductVariant.fulfilled, (state, action) => {
        state.loading = false;
        const productIndex = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (productIndex !== -1) {
          const variantIndex = state.products[productIndex].variants.findIndex(
            (v) => v._id === action.payload.variant._id
          );
          if (variantIndex !== -1) {
            state.products[productIndex].variants[variantIndex] =
              action.payload.variant; // Update the variant
          }
        }
      })
      .addCase(updateProductVariant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete product variant
      .addCase(deleteProductVariant.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProductVariant.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        const productIndex = state.products.findIndex(
          (p) => p._id === action.payload._id
        );

        if (productIndex !== -1) {
          state.products[productIndex].variants = state.products[
            productIndex
          ].variants.filter(
            (variant) => variant._id !== action.meta.arg.variantId
          );
        }
      })
      .addCase(deleteProductVariant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle product status (active/inactive)
      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        state.product = action.payload;
      })
      .addCase(toggleProductStatus.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch discounted products
      .addCase(fetchDiscountedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDiscountedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchDiscountedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch low stock products
      .addCase(fetchLowStockProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLowStockProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchLowStockProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch recently added products
      .addCase(fetchRecentlyAddedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecentlyAddedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchRecentlyAddedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk Update Products
      .addCase(bulkUpdateProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkUpdateProducts.fulfilled, (state, action) => {
        state.loading = false;
        const { successes, failures } = action.payload;

        successes.forEach(({ _id, message }) => {
          const index = state.products.findIndex(
            (product) => product._id === _id
          );
          if (index !== -1) {
            console.log(`Success: ${message} for product ID ${_id}`);
          }
        });

        failures.forEach(({ _id, message }) => {
          console.error(`Failure: ${message} for product ID ${_id}`);
        });
      })
      .addCase(bulkUpdateProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { clearError } = productSlice.actions;
export default productSlice.reducer;
