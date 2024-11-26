import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Attendance from "../../components/Attendance";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerDetails } from "../../redux/slices/customerSlice";
import { getCustomerSales } from "../../redux/slices/saleSlice";

const CustomerDetails = () => {
  const dispatch = useDispatch();
  const { customerId } = useLocalSearchParams();
  const { customer, loading, error } = useSelector((state) => state.customer);
  const { sales } = useSelector((state) => state.sale);

  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomer = async (customerId) => {
    await dispatch(fetchCustomerDetails(customerId));
  };

  const fetchSales = async (customerId) => {
    await dispatch(getCustomerSales(customerId));
  };

  useFocusEffect(
    useCallback(() => {
      fetchCustomer(customerId);
      fetchSales(customerId);
    }, [customerId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomer(customerId);
    await fetchSales(customerId);
    setRefreshing(false);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Displays time in 12-hour format with AM/PM
    }).format(date);
  };
  

  const renderTransaction = ({ item }) => {
    return (
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <View className="flex-1">
          <Text className="text-gray-800 font-medium">
            {item.productId.name} (x{item.quantity})
          </Text>
          <Text className="text-gray-600">{formatDateTime(item.date)}</Text>
          <Text className="text-gray-500 font-pmedium">{item.saleType}</Text>
        </View>
        <View>
          <Text className="text-gray-800 font-semibold">
            Total: ₹{item.price}
          </Text>
          {item.discount > 0 && (
            <Text className="text-gray-500">
              Discount: ₹{item.productId.discount}
            </Text>
          )}
          <Text
            className={`text-sm ${
              item.creditDetails?.paymentStatus === "paid"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {item.creditDetails?.paymentStatus}
          </Text>
        </View>
      </View>
    );
  };

  if (!customer) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="medium" color="green" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-gray-50 h-full">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Back Button */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push("/home");
              }
            }}
            style={{ marginRight: 5 }}
          >
            <Ionicons name="chevron-back" size={24} color="teal" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-teal-700">
            Customer Details
          </Text>
        </View>

        {/* Customer Info Card */}
        <View className="bg-white p-6 rounded-2xl shadow-lg mb-6 border border-gray-200">
          {/* Customer Name and Contact */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <LinearGradient
                colors={["#34d399", "#059669"]}
                className="rounded-full p-2"
              >
                <Ionicons
                  name="person-circle-outline"
                  size={48}
                  color="white"
                />
              </LinearGradient>
              <View className="ml-4">
                <Text className="text-2xl font-extrabold text-gray-900">
                  {customer.name}
                </Text>
                <Text className="text-gray-500 mt-1 text-sm">
                  {customer.mobile}
                </Text>
                {customer.whatsappNumber && (
                  <Text className="text-gray-500 mt-1 text-sm">
                    WhatsApp: {customer.whatsappNumber}
                  </Text>
                )}
              </View>
            </View>

            {/* Call and WhatsApp Icons aligned to right */}
            <View className="flex-col justify-between space-y-2">
              <TouchableOpacity
                onPress={() => {
                  const phoneNumber = `tel:+91 ${customer.mobile}`;
                  Linking.openURL(phoneNumber);
                }}
                className="bg-teal-100 p-3 rounded-full shadow-lg"
              >
                <Ionicons name="call-outline" size={24} color="teal" />
              </TouchableOpacity>

              {customer.whatsappNumber && (
                <TouchableOpacity
                  onPress={() => {
                    const whatsappUrl = `whatsapp://send?phone= +91${customer.whatsappNumber}`;
                    Linking.openURL(whatsappUrl);
                  }}
                  className="bg-green-100 p-3 rounded-full shadow-lg"
                >
                  <Ionicons name="logo-whatsapp" size={24} color="green" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Customer Address */}
          <View>
            <Text className="text-sm text-gray-700 leading-6">
              {`${customer.address.street}, ${customer.address.city}, ${customer.address.state} - ${customer.address.postalCode}, ${customer.address.country}`}
            </Text>
          </View>

          {/* Membership and Registration */}
          <View className="flex-row justify-between items-center mt-6 border-t border-gray-200 pt-4">
            <Text className="text-teal-700 font-bold">
              Membership:{" "}
              <Text
                className={
                  customer.membershipStatus === "active"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {customer.membershipStatus}
              </Text>
            </Text>
            <Text className="text-gray-600 font-medium">
              Joined: {customer.registrationDate.split("T")[0]}
            </Text>
          </View>

          {/* Udhar Balance */}
          <View className="flex-row justify-between mt-4">
            <Text className="text-teal-700 font-bold">
              Udhar Balance:{" "}
              <Text className="text-red-500">₹{customer.creditBalance}</Text>
            </Text>
            <Text className="text-teal-700 font-bold">
              Total Purchases: ₹{customer.totalPurchases}
            </Text>
          </View>
        </View>

        {/* Attendance Section */}
        <Attendance customer={customer} onRefresh={onRefresh} />

        {/* Action Buttons */}
        <View className="flex-col mb-8">
          <View className="flex-row justify-between mb-2">
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/customer/customer-edit",
                  params: { customerId },
                })
              }
              className="flex-row items-center bg-orange-100 p-3 rounded-lg shadow-sm border border-orange-200 flex-1 ml-1"
            >
              <Ionicons name="create-outline" size={24} color="teal" />
              <Text className="text-teal-800 ml-2 font-semibold">
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transactions Section */}
        <View className="bg-white p-5 rounded-lg shadow-md mb-6 border border-gray-200">
          <Text className="text-lg font-semibold text-teal-700 border-b border-gray-300 pb-2 mb-4">
            Transactions & Purchases
          </Text>
          {sales.length > 0 ? (
            <FlatList
              data={sales.slice().sort((a, b) => new Date(b.date) - new Date(a.date))}
              renderItem={renderTransaction}
              keyExtractor={(item) => item._id} // Ensure unique keys for each item
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text className="text-center text-gray-500">
              No transactions found.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerDetails;
