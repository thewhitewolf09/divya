import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SearchInput, Loader } from "../../components";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const CustomerList = () => {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "John Doe",
      phone: "9876543210",
      totalPurchases: 5000,
      creditBalance: 1000,
      address: {
        city: "Pune",
        state: "Maharashtra",
        country: "India",
      },
      isActive: true,
    },
    {
      id: 2,
      name: "Jane Smith",
      phone: "9123456789",
      totalPurchases: 3000,
      creditBalance: 500,
      address: {
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
      },
      isActive: false,
    },
    {
      id: 3,
      name: "Alex Johnson",
      phone: "9988776655",
      totalPurchases: 7000,
      creditBalance: 0,
      address: {
        city: "Delhi",
        state: "Delhi",
        country: "India",
      },
      isActive: true,
    },
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refreshing logic
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <Loader isLoading={isLoading} />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col align-middle my-3 px-4 space-y-6">
          {/* Header */}
          <View className="flex justify-between items-start flex-row mb-6">
            <View>
              <Text className="text-2xl font-semibold text-teal-700">
                Customers
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.replace("/notifications")}>
              <View className="mt-1.5">
                <Ionicons name="notifications" size={24} color="#0f766e" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <SearchInput />

          <View className="flex flex-row justify-between items-center my-4 ">
            {/* Products Count */}
            <Text className="text-gray-800 font-semibold text-lg">
              {customers.length} Customers
            </Text>

            {/* Filter & Sort Buttons */}
            <View className="flex flex-row space-x-3">
              {/* Filter Button */}
              <TouchableOpacity
                className="flex flex-row items-center border border-teal-600 rounded-lg py-2 px-3"
                onPress={() => alert("Filter Products")}
              >
                <Ionicons name="filter" size={18} color="#50B498" />
                <Text className="ml-1 text-teal-600 font-semibold">Filter</Text>
              </TouchableOpacity>

              {/* Sort Button */}
              <TouchableOpacity
                className="flex flex-row items-center border border-teal-600 rounded-lg py-2 px-3"
                onPress={() => alert("Sort Products")}
              >
                <Ionicons name="swap-vertical" size={18} color="#50B498" />
                <Text className="ml-1 text-teal-600 font-semibold">Sort</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Customer List */}
          <FlatList
            data={customers}
            keyExtractor={(item) => item.id.toString()}
            numColumns={1}
            renderItem={({ item }) => (
              <View className="flex flex-col items-start border border-gray-300 py-3 m-1 w-[98%] rounded-lg shadow-lg">
                {/* Top Section: Customer Name and Active Status */}
                <View className="flex flex-row justify-between w-[95%] items-center px-4">
                  <View className="flex flex-col">
                    {/* Customer Name */}
                    <Text className="text-gray-700 text-lg font-bold mb-1">
                      {item.name}
                    </Text>
                    {/* Active/Inactive Badge */}
                    <View
                      className={`${
                        item.isActive ? "bg-green-100" : "bg-red-100"
                      } py-1 px-2 rounded-full`}
                    >
                      <Text
                        className={`${
                          item.isActive ? "text-green-600" : "text-red-600"
                        } text-xs font-semibold`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>
                  {/* Customer Icon */}
                  <Ionicons name="person-circle" size={40} color="#50B498" />
                </View>

                {/* Customer Details */}
                <View className="flex flex-row justify-between w-[95%] items-center px-4 mt-2">
                  <Text className="text-gray-600">Phone: {item.phone}</Text>
                  <Text className="text-gray-600">
                    City: {item.address.city}
                  </Text>
                </View>

                {/* Purchases and Credit Balance */}
                <View className="flex flex-row justify-between w-[95%] items-center px-4 my-2">
                  <Text className="text-gray-800 font-bold">
                    Purchases: ₹{item.totalPurchases}
                  </Text>
                  <Text className="text-gray-500">
                    Credit: ₹{item.creditBalance}
                  </Text>
                </View>

                {/* View Details Button */}
                <TouchableOpacity
                  onPress={() => router.replace(`/customer/customer-details`)}
                  className="bg-teal-600 rounded py-2 px-4 mt-2 mx-4"
                >
                  <Text className="text-white font-semibold text-sm">
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Quick Actions */}
          <View className="flex flex-row flex-wrap justify-evenly mb-2 ">
            <ActionButton
              title=" Add Customer"
              icon="person-add"
              colors={["#DEF9C4", "#9CDBA6"]}
              onPress={() => router.replace("/customer/add-customer")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ActionButton = ({ title, icon, colors, onPress }) => (
  <LinearGradient
    colors={colors}
    className="rounded-lg p-4 my-1 mx-1 w-5/12 flex flex-row items-center justify-center"
    style={{ elevation: 2 }}
  >
    <TouchableOpacity onPress={onPress} style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
      <Ionicons name={icon} size={20} color="white" className="mr-2" />
      <Text className="text-white text-center font-bold">{title}</Text>
    </TouchableOpacity>
  </LinearGradient>
);

export default CustomerList;
