// store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { composeWithDevTools } from "@redux-devtools/extension";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import userReducer from "./slices/userSlice";
import productReducer from "./slices/productSlice";
import customerReducer from "./slices/customerSlice";
import saleReducer from "./slices/saleSlice";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/orderSlice";
import paymentReducer from "./slices/paymentSlice";
import notificationReducer from "./slices/notificationSlice"

// Redux persist configuration
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user"],
};

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer,
  product: productReducer,
  customer: customerReducer,
  sale: saleReducer,
  cart: cartReducer,
  order: orderReducer,
  payment: paymentReducer,
  notification: notificationReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the Redux store using Redux Toolkit
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For redux-persist compatibility
    }),
  devTools: process.env.NODE_ENV !== "production", // Enable DevTools in development
});

// Create persistor for redux-persist
const persistor = persistStore(store);

export { store, persistor };
