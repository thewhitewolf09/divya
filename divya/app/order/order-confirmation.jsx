import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Share,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { router } from "expo-router";
import moment from "moment";
import * as Clipboard from "expo-clipboard";

const OrderConfirmationScreen = () => {
  const { payment, order } = useSelector((state) => state.payment);

  const [loading, setLoading] = useState(false);

  // Function to copy text to clipboard
  const handleCopyToClipboard = (text) => {
    Clipboard.setStringAsync(text);
  };

  // Share receipt functionality
  const handleShareReceipt = async () => {
    try {
      const result = await Share.share({
        message: `Thank you for your purchase! Here is your order summary:\n\nOrder ID: ${
          order._id
        }\nCustomer ID: ${payment.customerId}\nTotal Amount: ₹${
          order.totalAmount
        }\nPayment Status: ${payment.status}\nTransaction ID: ${
          payment.transactionId
        }\nPayment Time: ${moment(payment.createdAt).format(
          "MMMM Do YYYY, h:mm:ss a"
        )}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type:", result.activityType);
        } else {
          console.log("Shared successfully!");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error) {
      console.error("Error sharing receipt:", error);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="px-4 mt-4 space-y-6">
          {/* Back Button & Title */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => {
                if (payment.status === "Success") {
                  router.push("/home");
                } else if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push("/home");
                }
              }}
              style={{ marginRight: 5 }}
            >
              <Ionicons name="chevron-back" size={28} color="teal" />
            </TouchableOpacity>

            <Text className="text-2xl font-extrabold text-teal-700">
              Order Confirmation
            </Text>
          </View>

          {/* Order Summary */}
          <View className="space-y-4 bg-gray-50 p-4 rounded-lg shadow-md">
            <Text className="text-xl font-semibold text-teal-700">
              Thank you for your purchase!
            </Text>
            <Text className="text-sm text-gray-600">
              Your order has been placed successfully. Here's a summary of your
              order:
            </Text>
            {order?.products.map((item, index) => (
              <View
                key={index}
                className="flex-row justify-between p-4 bg-white rounded-lg shadow-sm"
              >
                <Text className="text-sm text-gray-700 font-medium">
                  {item.productId.name} (x{item.quantity})
                </Text>
                <Text className="text-sm text-gray-700 font-bold">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            <Text className="text-lg font-extrabold text-teal-700 text-right mt-2">
              Total Amount: ₹{order.totalAmount.toFixed(2)}
            </Text>
          </View>

          {/* Payment Information */}
          <View className="space-y-4 bg-gray-50 p-4 rounded-lg shadow-md">
            <Text className="text-xl font-semibold text-teal-700">
              Payment Details
            </Text>
            <View
              className={`p-4 border rounded-lg ${
                payment.status === "Success"
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              } shadow-sm`}
            >
              <Text
                className={`text-sm font-bold ${
                  payment.status === "Success"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {payment.status === "Success"
                  ? "Payment Successful"
                  : "Payment Failed"}
              </Text>

              {/* Transaction Details */}
              {payment.status === "Success" && (
                <View className="mt-3 space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">
                      <Text className="font-semibold">Transaction ID:</Text>{" "}
                      {payment.transactionId}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleCopyToClipboard(payment.transactionId)
                      }
                    >
                      <Ionicons name="copy-outline" size={20} color="gray" />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-sm text-gray-600">
                    <Text className="font-semibold">Payment Time:</Text>{" "}
                    {moment(payment.createdAt).format(
                      "MMMM Do YYYY, h:mm:ss a"
                    )}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    <Text className="font-semibold">Payment Method:</Text>{" "}
                    {payment.method}
                  </Text>
                </View>
              )}

              {payment.status === "Failed" && (
                <TouchableOpacity
                  className="mt-2"
                  onPress={() => router.push("/order/checkout")}
                >
                  <Text className="text-teal-600 text-right font-bold underline">
                    Retry Payment
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Order and Customer Info */}
          <View className="space-y-4 bg-gray-50 p-4 rounded-lg shadow-md">
            <Text className="text-xl font-semibold text-teal-700">
              Order Information
            </Text>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">
                <Text className="font-semibold">Order ID:</Text> {order._id}
              </Text>
              <TouchableOpacity
                onPress={() => handleCopyToClipboard(order._id)}
              >
                <Ionicons name="copy-outline" size={20} color="gray" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">
                <Text className="font-semibold">Customer ID:</Text>{" "}
                {payment.customerId}
              </Text>
              <TouchableOpacity
                onPress={() => handleCopyToClipboard(payment.customerId)}
              >
                <Ionicons name="copy-outline" size={20} color="gray" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Share Receipt Icon */}
          <View className="flex-row justify-end mt-4 mr-4">
            <TouchableOpacity onPress={handleShareReceipt}>
              <Ionicons name="share-social-outline" size={38} color="teal" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderConfirmationScreen;
