import { useState, useCallback, useRef, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SearchInput, Loader } from "../../components";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllCustomers } from "../../redux/slices/customerSlice";
import BottomSheet from "@gorhom/bottom-sheet";
import FilterComponentCustomer from "../../components/FilterComponentCustomer";
import SortComponentCustomer from "../../components/SortComponentCustomer";

const CustomerList = () => {
  const dispatch = useDispatch();
  const { customers, totalCustomers, currentPage, totalPages, loading, error } =
    useSelector((state) => state.customer);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredResults, setFilteredResults] = useState(customers);

  // References to control the bottom sheet
  const [activeSheet, setActiveSheet] = useState(null);
  const [filterApplied, setFilterApplied] = useState(false);
  const filterSheetRef = useRef(null);
  const sortSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);

  // Function to toggle the filter bottom sheet
  const handleOpenFilter = () => {
    setActiveSheet("filter");
    filterSheetRef.current?.expand();
    sortSheetRef.current?.close(); // Close sort sheet if open
  };

  // Function to toggle the sort bottom sheet
  const handleOpenSort = () => {
    setActiveSheet("sort");
    sortSheetRef.current?.expand();
    filterSheetRef.current?.close(); // Close filter sheet if open
  };

  // Fetch Customers with Pagination
  const fetchCustomers = async () => {
    try {
      await dispatch(fetchAllCustomers()).unwrap();
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCustomers();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-white h-full">
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
        <SearchInput
          setFilteredResults={setFilteredResults}
          customers={customers}
          placeholder="Search a Customer"
        />

        <View className="flex flex-row justify-between items-center my-4 ">
          {/* Products Count */}
          <Text className="text-gray-800 font-semibold text-lg">
            {totalCustomers} Customers
          </Text>

          {/* Filter & Sort Buttons */}
          <View className="flex flex-row space-x-3">
            {/* Filter Button */}
            <TouchableOpacity
              className="flex flex-row items-center border border-teal-600 rounded-lg py-2 px-3"
              onPress={handleOpenFilter}
            >
              <Ionicons name="filter" size={18} color="#50B498" />
              <Text className="ml-1 text-teal-600 font-semibold">Filter</Text>
            </TouchableOpacity>

            {/* Sort Button */}
            <TouchableOpacity
              className="flex flex-row items-center border border-teal-600 rounded-lg py-2 px-3"
              onPress={handleOpenSort}
            >
              <Ionicons name="swap-vertical" size={18} color="#50B498" />
              <Text className="ml-1 text-teal-600 font-semibold">Sort</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Customer List */}
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item._id}
          numColumns={1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
                <Text className="text-gray-600">Phone: {item.mobile}</Text>
                <Text className="text-gray-600">City: {item.address.city}</Text>
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
                onPress={() =>
                  router.push({
                    pathname: "/customer/customer-details",
                    params: { customerId: item._id },
                  })
                }
                className="bg-teal-600 rounded py-2 px-4 mt-2 mx-4"
              >
                <Text className="text-white font-semibold text-sm">
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={() => (
            <View className="flex items-center justify-center mt-10">
              <Text className="text-gray-600 text-lg">
                No customers available.
              </Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 270 }}
        />

        {/* Quick Actions */}
        <View className="absolute bottom-48 left-4 right-4 bg-white p-2  flex flex-row justify-evenly">
          <ActionButton
            title=" Add Customer"
            icon="person-add"
            colors={["#DEF9C4", "#9CDBA6"]}
            onPress={() => router.replace("/customer/add-customer")}
          />
        </View>
      </View>

      {/* Filter Bottom Sheet */}
      <FilterComponentCustomer
        filterSheetRef={filterSheetRef}
        snapPoints={snapPoints}
        activeSheet={activeSheet}
        setActiveSheet={setActiveSheet}
        setFilterApplied={setFilterApplied}
        filterApplied={filterApplied}
      />

      {/* Sort Bottom Sheet */}
      <SortComponentCustomer
        sortSheetRef={sortSheetRef}
        snapPoints={snapPoints}
        activeSheet={activeSheet}
        setActiveSheet={setActiveSheet}
      />
    </SafeAreaView>
  );
};

const ActionButton = ({ title, icon, colors, onPress }) => (
  <LinearGradient
    colors={colors}
    className="rounded-lg p-4 my-1 mx-1 w-5/12 flex flex-row items-center justify-center"
    style={{ elevation: 2 }}
  >
    <TouchableOpacity
      onPress={onPress}
      style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
    >
      <Ionicons name={icon} size={20} color="white" className="mr-2" />
      <Text className="text-white text-center font-bold">{title}</Text>
    </TouchableOpacity>
  </LinearGradient>
);

export default CustomerList;
