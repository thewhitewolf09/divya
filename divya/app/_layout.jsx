import { useEffect, useRef, useState } from "react";
import { useFonts } from "expo-font";
import "react-native-url-polyfill/auto";
import { SplashScreen, Stack, useRouter } from "expo-router";
import GlobalProvider from "../context/GlobalProvider";
import { Provider } from "react-redux"; // Redux provider
import { PersistGate } from "redux-persist/integration/react"; // Persist gate for redux-persist
import { persistor, store } from "../redux/store";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useNotifications } from "../notification/notification";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  const { expoPushToken, notification } = useNotifications();

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return null; // Show nothing until fonts are loaded
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GlobalProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="notifications"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="track-daily-items"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="customer-credit"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="product/add-product"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="product/product-detail"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="product/product-edit"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="product/bulk-update"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="customer/add-customer"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="customer/customer-details"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="customer/customer-edit"
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="sale/product-selection-for-sale"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="sale/bill-generation"
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="sale/sales-performance"
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="sale/sales-history"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="sale/payment-history"
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="order/order-details"
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="order/order-details-admin"
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="order/view-cart"
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="order/checkout"
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="order/order-confirmation"
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="order/order-history"
                options={{ headerShown: false }}
              />
            </Stack>
          </GestureHandlerRootView>
          <StatusBar backgroundColor="#468585" style="light" />
        </GlobalProvider>
      </PersistGate>
    </Provider>
  );
};

export default RootLayout;
