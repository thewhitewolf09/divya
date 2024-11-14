import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { getOrdersByCustomer } from "../../redux/slices/orderSlice";

const OrderHistoryScreen = () => {
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
    await fetchOrders();
    setRefreshing(false);
  };

  // Sort orders by date (descending order)
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

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
              {item.products.length} items | ₹{item.totalAmount.toLocaleString()}
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
          {/* Back Button & Title */}
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() =>
                router.canGoBack() ? router.back() : router.push("/home")
              }
              style={{ marginRight: 5 }}
            >
              <Ionicons name="chevron-back" size={28} color="teal" />
            </TouchableOpacity>
            <Text className="text-2xl font-semibold text-teal-700">
              Order History
            </Text>
          </View>

          {/* Order List */}
          <FlatList
            data={sortedOrders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrder}
            ListEmptyComponent={() => (
              <View className="flex justify-center items-center mt-10">
                <Text className="text-gray-600 text-lg">
                  No previous orders found.
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderHistoryScreen;
