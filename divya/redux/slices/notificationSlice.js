import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

// Helper function to get the token
const getToken = (state) => state.user.token;

// Create Notification
export const createNotification = createAsyncThunk(
  "notifications/createNotification",
  async (notificationData, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.post("/api/notifications/create", notificationData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.notification;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Fetch Notifications
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async ({ role, id }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.get(`/api/notifications/fetch/${role}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.notifications;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Mark Notification as Read
export const markReadNotification = createAsyncThunk(
  "notifications/markReadNotification",
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      const response = await api.patch(`/api/notifications/mark-read/${id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.notification;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Delete Notification
export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const token = getToken(state);

    try {
      await api.delete(`/api/notifications/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data.resultMessage);
    }
  }
);

// Notification slice
const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Notification
      .addCase(createNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications.push(action.payload);
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark Notification as Read
      .addCase(markReadNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(markReadNotification.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.notifications.findIndex((n) => n._id === action.payload._id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
      })
      .addCase(markReadNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.filter((n) => n._id !== action.payload);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNotificationError } = notificationSlice.actions;

export default notificationSlice.reducer;
