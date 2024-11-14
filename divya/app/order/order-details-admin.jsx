import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
  ActivityIndicator,
  Button,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import {
  updateOrderStatus,
  getOrderById,
  cancelOrder,
} from "../../redux/slices/orderSlice";
import * as Clipboard from "expo-clipboard";
import moment from "moment";

const AdminOrderDetailScreen = () => {
  const dispatch = useDispatch();
  const { orderId } = useLocalSearchParams();
  const { order } = useSelector((state) => state.order);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log(order);

  const fetchOrder = async (orderId) => {
    await dispatch(getOrderById(orderId));
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrder(orderId);
    }, [orderId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrder(orderId);
    setRefreshing(false);
  };

  const handleUpdateStatus = async (status) => {
    setLoading(true);
    try {
      await dispatch(updateOrderStatus({ orderId, status }));
      Alert.alert("Success", "Order status updated successfully.");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    Clipboard.setStringAsync(text);
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      await dispatch(cancelOrder(orderId));
      Alert.alert("Success", "Order has been canceled.");
      router.back(); // Optionally, navigate back to the previous screen
    } catch (error) {
      Alert.alert("Error", "Unable to cancel the order.");
    } finally {
      setLoading(false);
    }
  };

  const orderStages = [
    "Order Placed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  return (
    <SafeAreaView className="bg-gray-50 h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-4 py-6">
          {/* Header with Back Button */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() =>
                router.canGoBack() ? router.back() : router.push("/home")
              }
              className="mr-4"
            >
              <Ionicons name="chevron-back" size={28} color="#0f766e" />
            </TouchableOpacity>
            <Text className="text-2xl font-semibold text-teal-700">
              Order Details
            </Text>
          </View>

          {/* Customer Information */}
          <View className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-300">
            <Text className="text-xl font-semibold text-teal-700 mb-4">
              Customer Information
            </Text>
            <View className="space-y-3">
              <Text className="text-base text-gray-700">
                <Text className="font-medium text-gray-600">Name:</Text>{" "}
                {order?.customerId?.name}
              </Text>
              <Text className="text-base text-gray-700">
                <Text className="font-medium text-gray-600">Contact:</Text>{" "}
                {order?.customerId?.mobile}
              </Text>
              <Text className="text-base text-gray-700">
                <Text className="font-medium text-gray-600">Address:</Text>{" "}
                {order?.deliveryAddress?.street}, {order?.deliveryAddress?.city}
                , {order?.deliveryAddress?.state},{" "}
                {order?.deliveryAddress?.country}
              </Text>
            </View>
          </View>

          {/* Products List */}
          <View className="bg-white shadow-lg rounded-lg p-6 mb-4">
            <Text className="text-xl font-semibold text-teal-700 mb-2">
              Ordered Products
            </Text>
            {order?.products.map((item) => (
              <View key={item?._id} className="flex-row items-center p-4 my-1">
                <Image
                  source={{ uri: item?.productId?.productImage }}
                  className="w-20 h-20 rounded-md border"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-4">
                  <Text className="text-md font-semibold text-[#2c3e50]">
                    {item?.productId?.name}
                  </Text>
                  <Text className="text-sm text-gray-700">
                    Quantity: {item?.quantity}
                  </Text>
                  <Text className="text-sm text-gray-700">
                    Unit Price: ₹{item?.price}
                  </Text>
                  <Text className="text-sm text-gray-800">
                    Subtotal: ₹{(item?.price * item?.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Payment Details */}
          <View className="bg-white shadow-lg rounded-lg p-4 mb-6">
            <Text className="text-xl font-semibold text-teal-700 mb-3">
              Payment Information
            </Text>

            <View className="space-y-3">
              {/* Payment Method */}
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-700">
                  <Ionicons name="card-outline" size={16} color="gray" />{" "}
                  Method:
                </Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {order?.payment?.method}
                </Text>
              </View>

              {/* Payment Status */}
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-700">
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={16}
                    color="gray"
                  />{" "}
                  Status:
                </Text>
                <Text
                  className={`text-sm font-semibold ${
                    order?.payment?.status === "Success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {order?.payment?.status}
                </Text>
              </View>

              {/* Transaction ID with Copy Action */}
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-700">
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color="gray"
                  />{" "}
                  Transaction ID:
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-sm font-semibold text-gray-900 mr-2">
                    {order?.payment?.transactionId}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleCopyToClipboard(order?.payment?.transactionId)
                    }
                  >
                    <Ionicons name="copy-outline" size={18} color="teal" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Payment Date */}
              <View className="flex-row justify-between items-center mt-3">
                <Text className="text-sm font-medium text-gray-700">
                  <Ionicons name="time-outline" size={16} color="gray" />{" "}
                  Payment Date:
                </Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {moment(order?.payment?.createdAt).format(
                    "MMMM Do YYYY, h:mm:ss a"
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/* Order Tracking */}

          {order?.status === "Cancelled" ? (
            // Display "Order Cancelled" message if order is cancelled
            <View className="bg-gray-100 border border-gray-300 rounded-lg p-5 flex items-center justify-center">
              <Ionicons name="close-circle-outline" size={36} color="#7a7a7a" />
              <Text className="text-gray-700 text-lg font-medium mt-3">
                Order Cancelled
              </Text>
              <Text className="text-gray-500 mt-1 text-center text-sm">
                Unfortunately, this order cannot be processed.
              </Text>
            </View>
          ) : (
            // Show order tracking stages if order is not cancelled
            <View className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-300">
              <Text className="text-xl font-semibold text-teal-700 mb-4">
                Order Tracking
              </Text>

              <View className="flex-row justify-between items-center">
                {orderStages.map((stage, index) => {
                  const isCompleted =
                    orderStages.indexOf(order?.status) >= index;
                  return (
                    <TouchableOpacity
                      key={index}
                      className={`${
                        isCompleted ? "bg-teal-500" : "bg-gray-200"
                      } w-12 h-12 rounded-full flex items-center justify-center border-2 border-gray-300 mx-2`}
                      onPress={() => handleUpdateStatus(stage)}
                      disabled={loading}
                    >
                      <Ionicons
                        name={isCompleted ? "checkmark" : "ellipse"}
                        size={22}
                        color={isCompleted ? "white" : "#B0BEC5"}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Text for stages */}
              <View className="flex-row justify-between mt-2">
                {orderStages.map((stage, index) => (
                  <Text
                    key={index}
                    className="text-xs text-center text-gray-800"
                  >
                    {stage}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Cancel Order Button */}
          <View className="mb-6 mt-6">
            <TouchableOpacity
              onPress={handleCancelOrder}
              disabled={
                loading ||
                order?.status === "Delivered" ||
                order?.status === "Cancelled"
              }
              className={`bg-red-600 w-full py-3 rounded-lg flex items-center justify-center ${
                loading ||
                order?.status === "Delivered" ||
                order?.status === "Cancelled"
                  ? "opacity-50"
                  : ""
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Cancel Order
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminOrderDetailScreen;
