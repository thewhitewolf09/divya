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
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { cancelOrder, getOrderById } from "../../redux/slices/orderSlice";
import * as Clipboard from "expo-clipboard";
import moment from "moment";
import { addItemToCart } from "../../redux/slices/cartSlice";

const OrderDetailScreen = () => {
  const dispatch = useDispatch();
  const { orderId } = useLocalSearchParams();
  const { user } = useSelector((state) => state.user);
  const { order } = useSelector((state) => state.order);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Function to copy text to clipboard
  const handleCopyToClipboard = (text) => {
    Clipboard.setStringAsync(text);
  };

  const handleCancelOrder = () => {
    // Show confirmation dialog
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this order?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            // Dispatch the cancelOrder action with the order ID
            const orderId = order._id; // Replace with your actual order ID
            try {
              await dispatch(cancelOrder(orderId)).unwrap();
              Alert.alert(
                "Success",
                "Your order has been successfully canceled."
              );
              // Optionally navigate back or refresh data
            } catch (error) {
              Alert.alert("Error", error); // Handle error response
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleReorder = async () => {
    setLoading(true);
    const reorderPromises = order.products.map(async (item) => {
      const { payload } = await dispatch(
        addItemToCart({
          customerId: user._id,
          item: {
            productId: item.productId._id,
            variantId: item.variantId || null,
            quantity: item.quantity,
          },
        })
      );
      return payload;
    });

    const results = await Promise.all(reorderPromises);
    setLoading(false);
    // Check if all items were successfully added to the cart
    const allSuccess = results.every((result) => result);

    if (allSuccess) {
      Alert.alert("Success", "All items have been added to your cart.");
      router.push("/order/view-cart");
    } else {
      Alert.alert(
        "Reorder Summary",
        "Some items could not be added to the cart. Please try again."
      );
    }
  };

  const contactSupport = () => {
    Linking.openURL("mailto:support@yourapp.com?subject=Help Request");
  };

  // Mapping order status to the order stages for the tracking display
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

          {/* Products List */}
          <View className="bg-white shadow-lg rounded-lg p-6 space-y-4">
            <Text className="text-xl font-semibold text-teal-700 mb-2">
              Products
            </Text>

            {order?.products.map((item) => (
              <View
                key={item?._id}
                className="bg-gray-50 shadow-md rounded-lg flex-row items-center p-4 my-1 space-x-4"
              >
                <Image
                  source={{ uri: item?.productId?.productImage }}
                  className="w-20 h-20 rounded-md border border-gray-300"
                  resizeMode="cover"
                />

                <View className="flex-1">
                  {/* Product Name */}
                  <Text className="text-md font-semibold text-[#2c3e50] mb-1">
                    {item?.productId?.name}
                  </Text>

                  {/* Product Category */}
                  <Text className="text-sm text-gray-500 mb-1">
                    Category: {item?.productId?.category?.join(", ") || "N/A"}
                  </Text>

                  {item.variantId && item.productId?.variants ? (
                    <Text className="text-sm text-[#7f8c8d]">
                      {
                        item.productId.variants.find(
                          (variant) => variant._id === item.variantId
                        )?.variantName
                      }
                    </Text>
                  ) : null}

                  {/* Quantity and Price */}
                  <View className="flex-row items-center space-x-4 mt-1">
                    <Text className="text-sm text-gray-700">
                      Quantity: {item?.quantity}
                    </Text>
                    <Text className="text-sm text-gray-700">
                      Unit Price: ₹{item?.price.toFixed(2)}
                    </Text>
                  </View>

                  {/* Subtotal */}
                  <Text className="text-sm font-medium text-gray-800 mt-2">
                    Subtotal: ₹{(item?.price * item?.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Order Tracking */}
          <View className="bg-white shadow-md rounded-lg p-4 mb-6">
            <Text className="text-lg font-semibold text-teal-700 mb-4">
              Order Tracking
            </Text>

            {order?.status === "Cancelled" ? (
              // Display "Order Cancelled" message if order is cancelled
              <View className="bg-gray-100 border border-gray-300 rounded-lg p-5 flex items-center justify-center">
                <Ionicons
                  name="close-circle-outline"
                  size={36}
                  color="#7a7a7a"
                />
                <Text className="text-gray-700 text-lg font-medium mt-3">
                  Order Cancelled
                </Text>
                <Text className="text-gray-500 mt-1 text-center text-sm">
                  Unfortunately, this order cannot be processed.
                </Text>
              </View>
            ) : (
              // Show order tracking stages if order is not cancelled
              <View className="flex-row justify-between items-center">
                {orderStages.map((stage, index) => (
                  <View key={index} className="flex-1 items-center">
                    <View
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        orderStages.indexOf(order?.status) >= index
                          ? "bg-teal-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <Ionicons
                        name={
                          orderStages.indexOf(order?.status) >= index
                            ? "checkmark"
                            : "ellipse"
                        }
                        size={16}
                        color="white"
                      />
                    </View>
                    <Text
                      className={`text-xs text-center mt-2 ${
                        orderStages.indexOf(order?.status) >= index
                          ? "text-teal-600"
                          : "text-gray-500"
                      }`}
                    >
                      {stage}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Delivery Address */}
          <View className="bg-white shadow-md rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold text-teal-700 mb-1">
              Delivery Address
            </Text>
            <Text className="text-gray-700">{`${order?.deliveryAddress?.street}, ${order?.deliveryAddress?.city}, ${order?.deliveryAddress?.state} - ${order?.deliveryAddress?.postalCode}`}</Text>
            <Text className="text-gray-700">
              {order?.deliveryAddress?.country}
            </Text>

            {/* Delivery Policy Message */}
            <View className="p-4 border border-red-300 bg-red-50 rounded-lg mt-4">
              <Text className="text-sm text-red-600">
                Delivery is currently closed. Only customers with membership can
                have products delivered to their doorstep. Irregular users must
                pick up their orders from the shop.
              </Text>
            </View>
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

          {/* Total Amount */}
          <View className="bg-white shadow-md rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold text-teal-700">
              Total Amount: ₹{order?.totalAmount.toFixed(2)}
            </Text>
          </View>
          {/* Action Buttons */}
          <View className="flex-row space-x-3 justify-between mt-6">
            {/* Reorder Button */}
            <TouchableOpacity
              onPress={handleReorder}
              className="bg-teal-600 py-2 px-6 rounded-lg shadow-lg flex-row items-center space-x-2"
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                // Show loader when loading
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={18} color="white" />
                  <Text className="text-white font-semibold">Reorder</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Cancel Order Button */}
            <TouchableOpacity
              onPress={handleCancelOrder}
              disabled={order?.status !== "Order Placed"} // Button is disabled if order status is not "Order Placed"
              className={`${
                order?.status !== "Order Placed" ? "bg-gray-300" : "bg-red-500"
              } py-2 px-6 rounded-lg shadow-lg flex-row items-center space-x-2`}
            >
              <Ionicons
                name="close-circle-outline"
                size={18}
                color={order?.status !== "Order Placed" ? "gray" : "white"}
              />
              <Text
                className={`${
                  order?.status !== "Order Placed"
                    ? "text-gray-500"
                    : "text-white"
                } font-semibold`}
              >
                Cancel Order
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contact Support Button */}
          <View className="flex items-center mt-6">
            <TouchableOpacity
              onPress={contactSupport}
              className="bg-blue-600 py-2 px-8 rounded-lg shadow-lg flex-row items-center space-x-2"
            >
              <Ionicons name="chatbubbles-outline" size={18} color="white" />
              <Text className="text-white font-semibold">Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;
