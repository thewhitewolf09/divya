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
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Attendance from "../../components/Attendance";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerDetails } from "../../redux/slices/customerSlice";

const CustomerDetails = () => {
  const dispatch = useDispatch();
  const { customerId } = useLocalSearchParams();
  const { customer, loading, error } = useSelector((state) => state.customer);
  const [refreshing, setRefreshing] = useState(false);


  const salesRecords = [
    {
      productId: "1",
      productName: "Milk",
      quantity: 2,
      price: 100,
      date: "2024-09-20",
      paymentMethod: "Cash",
      discount: 0,
      status: "Completed",
      totalPrice: 200, // (100 - 0) * 2
    },
    {
      productId: "2",
      productName: "Badam Juice",
      quantity: 1,
      price: 50,
      date: "2024-09-21",
      paymentMethod: "Online",
      discount: 5,
      status: "Completed",
      totalPrice: 45, // (50 - 5) * 1
    },
    {
      productId: "3",
      productName: "Paneer",
      quantity: 1,
      price: 70,
      date: "2024-09-22",
      paymentMethod: "Cash",
      discount: 0,
      status: "Completed",
      totalPrice: 70, // (70 - 0) * 1
    },
    {
      productId: "4",
      productName: "Fruits",
      quantity: 3,
      price: 90,
      date: "2024-09-23",
      paymentMethod: "Online",
      discount: 10,
      status: "Pending",
      totalPrice: 240, // (90 - 10) * 3
    },
    {
      productId: "5",
      productName: "Yogurt",
      quantity: 2,
      price: 120,
      date: "2024-09-24",
      paymentMethod: "Cash",
      discount: 0,
      status: "Completed",
      totalPrice: 240, // (120 - 0) * 2
    },
    {
      productId: "6",
      productName: "Bread",
      quantity: 5,
      price: 150,
      date: "2024-09-25",
      paymentMethod: "Online",
      discount: 5,
      status: "Completed",
      totalPrice: 725, // (150 - 5) * 5
    },
    {
      productId: "7",
      productName: "Cheese",
      quantity: 1,
      price: 200,
      date: "2024-09-26",
      paymentMethod: "Cash",
      discount: 0,
      status: "Completed",
      totalPrice: 200, // (200 - 0) * 1
    },
    {
      productId: "8",
      productName: "Chocolate Cake",
      quantity: 1,
      price: 300,
      date: "2024-09-27",
      paymentMethod: "Online",
      discount: 20,
      status: "Completed",
      totalPrice: 280, // (300 - 20) * 1
    },
    {
      productId: "9",
      productName: "Vegetable Basket",
      quantity: 4,
      price: 240,
      date: "2024-09-28",
      paymentMethod: "Cash",
      discount: 15,
      status: "Completed",
      totalPrice: 885, // (240 - 15) * 4
    },
    {
      productId: "10",
      productName: "Chicken",
      quantity: 1,
      price: 500,
      date: "2024-09-29",
      paymentMethod: "Online",
      discount: 50,
      status: "Pending",
      totalPrice: 450, // (500 - 50) * 1
    },
  ];

 

  const fetchCustomer = async (customerId) => {
    await dispatch(fetchCustomerDetails(customerId));
  };


   

  useFocusEffect(
    useCallback(() => {
      fetchCustomer(customerId);
    }, [customerId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomer(customerId);
    setRefreshing(false);
  };

  // const handleToggleStatus = () => {
  //   setCustomerDetails((prevCustomer) => ({
  //     ...prevCustomer,
  //     isActive: !prevCustomer.isActive,
  //   }));
  //   Alert.alert(
  //     "Status Updated",
  //     `Customer is now ${!customerDetails.isActive ? "active" : "inactive"}`
  //   );
  // };

  const renderTransaction = ({ item }) => (
    <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
      <View className="flex-1">
        <Text className="text-gray-800 font-medium">
          {item.productName} (x{item.quantity})
        </Text>
        <Text className="text-gray-600">{item.date}</Text>
        <Text className="text-gray-500 font-pmedium">{item.paymentMethod}</Text>
      </View>
      <View>
        <Text className="text-gray-800 font-semibold">
          Total: ₹{item.totalPrice}
        </Text>
        {item.discount > 0 && (
          <Text className="text-gray-500">Discount: ₹{item.discount}</Text>
        )}
        <Text
          className={`text-sm ${
            item.status === "Completed" ? "text-green-600" : "text-red-600"
          }`}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );



  if (!customer) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>No customer details found.</Text>
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
              <Text className="text-red-500">
                ₹{customer.creditBalance}
              </Text>
            </Text>
            <Text className="text-teal-700 font-bold">
              Total Purchases: ₹{customer.totalPurchases}
            </Text>
          </View>
        </View>

        {/* Attendance Section */}
        <Attendance customer={customer} onRefresh={onRefresh}/>

        {/* Action Buttons */}
        <View className="flex-col mb-8">
          <TouchableOpacity className="flex-row items-center bg-teal-100 p-3 rounded-lg shadow-sm border border-teal-200 mb-2">
            <MaterialIcons name="receipt" size={24} color="teal" />
            <Text className="text-teal-800 ml-2 font-semibold">
              Generate Bill
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-between mb-2">
            <TouchableOpacity className="flex-row items-center bg-green-100 p-3 rounded-lg shadow-sm border border-green-200 flex-1 mr-1">
              <Ionicons name="cash-outline" size={24} color="green" />
              <Text className="text-green-800 ml-2 font-semibold">
                Mark Udhar Paid
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/customer/customer-edit",
                  params: { customerId},
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
          {salesRecords.length > 0 ? (
            <FlatList
              data={salesRecords}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.productId} // Ensure unique keys for each item
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
