import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import {getOrdersByCustomer } from "../../redux/slices/orderSlice";

// Action Button Component
const ActionButton = ({ title, icon, colors, onPress }) => (
  <LinearGradient
    colors={colors}
    className="rounded-lg p-4 w-5/12 flex-row items-center justify-center shadow-md"
  >
    <TouchableOpacity onPress={onPress} className="flex flex-row items-center">
      <Ionicons name={icon} size={20} color="white" className="mr-2" />
      <Text className="text-white font-semibold text-center ml-2">{title}</Text>
    </TouchableOpacity>
  </LinearGradient>
);

const MyOrdersScreen = () => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);

  
  const fetchOrders = async (customerId) => {
    await dispatch(getOrdersByCustomer(customerId));
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders(user._id);
    }, [user._id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(user._id);
    setRefreshing(false);
  };

  // Sort orders by date (descending order) and show only the most recent entries (e.g., 5 recent orders)
  const sortedOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5); // Show the 5 most recent orders

  // Render function for each order
  const renderOrder = ({ item }) => {
    const productNames = item.products
      .map((product) => product.productId.name)
      .join(", ");

    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/order/order-details",
            params: { orderId: item._id },
          });
        }}
        className="border border-gray-300 rounded-lg shadow-lg mx-auto w-full mb-4 p-4 bg-white"
      >
        {/* Order Summary */}
        <View className="flex flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-gray-800 text-base font-semibold">
              {productNames}
            </Text>
            <Text className="text-gray-600 text-base">
              {item.products.length} items | ₹
              {item.totalAmount.toLocaleString()}
            </Text>
          </View>
          <Ionicons name="cart" size={50} color="#0f766e" />
        </View>

        {/* Order Status and Date */}
        <View className="flex flex-row justify-between items-center mb-3">
          <Text
            className={`font-semibold ${
              item.status === "Delivered"
                ? "text-green-600"
                : item.status === "Pending"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            Status: {item.status}
          </Text>
          <Text className="text-gray-500">
            {new Date(item.createdAt).toLocaleDateString("en-IN")}
          </Text>
        </View>

        {/* Delivery Address */}
        <Text className="text-gray-700 text-sm mb-2">
          <Text className="font-semibold">Delivery to: </Text>
          {`${item.deliveryAddress.street}, ${item.deliveryAddress.city}, ${item.deliveryAddress.state}, ${item.deliveryAddress.postalCode}`}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-4 py-4 space-y-6">
          {/* Header */}
          <View className="flex justify-between items-start flex-row mb-6">
            <View>
              <Text className="text-2xl font-semibold text-teal-700">
                My Orders
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.replace("/notifications")}>
              <View className="mt-1.5">
                <Ionicons name="notifications" size={24} color="#0f766e" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Actions Section */}
          <View className="flex flex-row justify-between mb-4">
            <ActionButton
              title="View Cart"
              icon="cart"
              colors={["#0f766e", "#0f766e"]}
              onPress={() => router.replace("/order/view-cart")}
            />
            <ActionButton
              title="Order History"
              icon="time"
              colors={["#0f766e", "#0f766e"]}
              onPress={() => router.replace("/order/order-history")}
            />
          </View>

          {/* Order List Section */}
          <Text className="text-lg font-semibold text-gray-700">
            Current Orders
          </Text>
          <FlatList
            data={sortedOrders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrder}
            ListEmptyComponent={() => (
              <View className="flex justify-center items-center mt-10">
                <Text className="text-gray-600 text-lg">
                  No orders available.
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyOrdersScreen;
