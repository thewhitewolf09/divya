import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchInput } from "../components";
import { router, useFocusEffect } from "expo-router";
import {
  fetchAllCustomers,
  recordDailyItemAttendance,
  updateDailyItemQuantity,
} from "../redux/slices/customerSlice";
import { useDispatch, useSelector } from "react-redux";
import BottomSheet from "@gorhom/bottom-sheet";

const TrackDailyItems = () => {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.customer);
  const [refreshing, setRefreshing] = useState(false);
  const todayDate = new Date();
  const [selectedDate, setSelectedDate] = useState(todayDate.toISOString());
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [loadingItems, setLoadingItems] = useState({});
  const [activeSheet, setActiveSheet] = useState(null);

  // References to control the bottom sheet
  const filterSheetRef = useRef(null);
  const sortSheetRef = useRef(null);

  // Snap points for the bottom sheet
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

  const [searchCustomer, setSearchCustomer] = useState(customers);

  const handleQuantityChange = (itemId, value) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemId]: value,
    }));
  };

  // Function to mark attendance for the date
  const markAttendance = async (itemName, isTaken, quantity, itemId) => {
    try {
      setLoadingItems((prev) => ({ ...prev, [itemId]: true })); // Set loading for specific item
      await dispatch(
        recordDailyItemAttendance({
          id: selectedCustomer._id,
          itemName,
          date: selectedDate,
          quantity,
        })
      ).unwrap();

      // Dispatch quantity update for the daily item
      await dispatch(
        updateDailyItemQuantity({
          id: selectedCustomer._id,
          itemName,
          quantity,
        })
      ).unwrap();

      Alert.alert("Success", "Attendance marked successfully!");
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      Alert.alert("Error", error);
    } finally {
      setLoadingItems((prev) => ({ ...prev, [itemId]: false })); // Reset loading for specific item
    }
  };

  const openModal = (customer) => {
    setSelectedCustomer(customer);
    setModalVisible(true);
    const initialQuantities = Object.keys(customer.dailyItems).reduce(
      (acc, itemName) => ({
        ...acc,
        [itemName]: 0, // Default quantity to 0
      }),
      {}
    );
    setQuantities(initialQuantities);
  };

  const isAttendanceComplete = (customer, selectedDate) => {
    const dailyItems = customer.dailyItems;

    if (!dailyItems || dailyItems.length === 0) {
      return false;
    }

    return dailyItems.some((item) => {
      const attendance = item.attendance;

      if (!attendance || attendance.length === 0) {
        return false;
      }

      return attendance.some((entry) => {
        const today = selectedDate;
        return entry.date.split("T")[0] === today.split("T")[0] && entry.taken;
      });
    });
  };

  const fetchCustomers = async () => {
    await dispatch(fetchAllCustomers());
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

  const handleCloseSheet = () => {
    setActiveSheet(null);
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        className="p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
            <Ionicons name="chevron-back" size={28} color="teal" />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold text-teal-700">
            Track daily items
          </Text>
        </View>

        {/* Search Input */}
        <SearchInput
          customers={customers}
          setFilteredResults={setSearchCustomer}
          placeholder="Search for a customer"
        />

        <View className="flex flex-row justify-between items-center my-4 ">
          {/* Products Count */}
          <Text className="text-gray-800 font-semibold text-lg">
            {
              searchCustomer.filter(
                (customer) => customer.membershipStatus === "active"
              ).length
            }{" "}
            Customers
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
        {searchCustomer.length > 0 ? (
          searchCustomer
            .filter((customer) => customer.membershipStatus === "active")
            .map((customer) => {
              const totalItems = Object.keys(customer.dailyItems).length;
              const isComplete = isAttendanceComplete(customer, selectedDate);
              const backgroundColor = isComplete
                ? "bg-green-100"
                : "bg-red-100";
              const borderColor = isComplete
                ? "border-green-500"
                : "border-red-500";

              return (
                <TouchableOpacity
                  key={customer.phone}
                  onPress={() => openModal(customer)}
                  className={`py-3 px-4 mb-3 ${backgroundColor} rounded-lg shadow-sm border ${borderColor} flex-row items-center justify-between`}
                >
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-teal-700">
                      {customer.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {customer.mobile}
                    </Text>
                    <Text className="text-sm text-gray-400">
                      {customer.address.city}, {customer.address.state},{" "}
                      {customer.address.country}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {totalItems} daily items
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="gray" />
                </TouchableOpacity>
              );
            })
        ) : (
          <Text className="text-gray-600 italic mt-2">No customers found.</Text>
        )}

        {/* Modal for updating attendance */}
        {selectedCustomer && isModalVisible && (
          <Modal visible={isModalVisible} transparent animationType="slide">
            <View className="flex-1 justify-center items-center bg-gray-800 bg-opacity-50">
              <View className="bg-white p-6 rounded-lg shadow-lg max-h-[90%] w-[90%]">
                <Text className="text-teal-700 font-semibold text-lg mb-4">
                  Mark Attendance for {selectedDate.split("T")[0]}
                </Text>

                <ScrollView>
                  {selectedCustomer?.dailyItems?.map((item) => {
                    const attendanceRecord = item.attendance?.find((att) => {
                      const attDateString = new Date(att.date)
                        .toISOString()
                        .split("T")[0];

                      return attDateString === selectedDate.split("T")[0];
                    });

                    const isTaken = attendanceRecord
                      ? attendanceRecord.taken
                      : false;

                    return (
                      <View key={item._id} className="mb-4">
                        <Text className="text-teal-800 font-semibold text-md mb-2">
                          {item.itemName.name} ({item.quantityPerDay}{" "}
                          {item.itemName.unit})
                          {isTaken ? (
                            <Text className="text-green-600 ml-2 text-2xl">
                              {" "}
                              ✅
                            </Text>
                          ) : (
                            <Text className="text-green-600 ml-2 text-2xl">
                              {" "}
                              ❌
                            </Text>
                          )}
                        </Text>

                        <TextInput
                          value={quantities[item.itemName._id] || ""}
                          onChangeText={(value) =>
                            handleQuantityChange(item.itemName._id, value)
                          }
                          placeholder="Enter Quantity"
                          keyboardType="numeric"
                          className="border border-gray-300 p-2 rounded-lg mb-2"
                        />

                        <TouchableOpacity
                          className={`flex-row justify-between items-center mb-2 ${
                            isTaken ? "bg-gray-300" : "bg-green-100"
                          } p-2 rounded-lg`}
                          onPress={() => {
                            markAttendance(
                              item.itemName.name,
                              true,
                              quantities[item.itemName._id] ||
                                item.quantityPerDay,
                              item.itemName._id // Pass item ID for loading state
                            );
                          }}
                          disabled={loadingItems[item.itemName._id] || loading} // Disable button when attendance is being marked
                        >
                          <Text
                            className={`font-semibold ${
                              isTaken ? "text-gray-600" : "text-green-600"
                            }`}
                          >
                            {isTaken ? "Already Taken" : "Mark Taken"}
                          </Text>

                          {/* Conditionally show loader or checkmark */}
                          {loadingItems[item.itemName._id] ? (
                            <ActivityIndicator size="small" color="green" />
                          ) : (
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={24}
                              color={isTaken ? "gray" : "green"}
                            />
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          className="flex-row justify-between items-center bg-red-100 p-2 rounded-lg"
                          onPress={() => {
                            markAttendance(
                              item.itemName.name,
                              false,
                              0,
                              item.itemName._id
                            ); // Pass item ID for loading state
                          }}
                          disabled={loadingItems[item.itemName._id] || loading}
                        >
                          <Text className="text-red-600 font-semibold">
                            Not Taken
                          </Text>

                          {/* Conditionally show loader or close icon */}
                          {loadingItems[item.itemName._id] ? (
                            <ActivityIndicator size="small" color="red" />
                          ) : (
                            <Ionicons
                              name="close-circle-outline"
                              size={24}
                              color="red"
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>

                {/* Close modal button */}
                <TouchableOpacity
                  className="bg-teal-500 p-3 rounded-lg mt-4"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white font-semibold text-center">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        ref={filterSheetRef}
        index={activeSheet === "filter" ? 0 : -1}
        snapPoints={snapPoints}
        onClose={handleCloseSheet}
        enablePanDownToClose
      >
        <View className="p-4 bg-white rounded-t-lg shadow-lg">
          <Text className="text-lg font-bold mb-4 text-teal-700">
            Filter By
          </Text>

          {/* Filter Options */}
          <TouchableOpacity
            onPress={() => handleFilterSelect("category")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Category</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFilterSelect("price")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Price Range</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFilterSelect("stock")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Stock Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFilterSelect("discount")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Discounted Items</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFilterSelect("active")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Active Items</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFilterSelect("low-stock")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Low Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFilterSelect("recently-added")}
            className="py-3"
          >
            <Text className="text-gray-800 text-base">Recently Added</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Sort Bottom Sheet */}
      <BottomSheet
        ref={sortSheetRef}
        index={activeSheet === "sort" ? 0 : -1}
        snapPoints={snapPoints}
        onClose={handleCloseSheet}
        enablePanDownToClose
        style={{ zIndex: 1001 }}
      >
        <View className="p-4 bg-white rounded-t-lg shadow-lg">
          <Text className="text-lg font-bold mb-4 text-teal-700">Sort By</Text>

          {/* Sort Options */}
          <TouchableOpacity
            onPress={() => handleSortSelect("relevance")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Relevance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSortSelect("price-asc")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Price: Low to High</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSortSelect("price-desc")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Price: High to Low</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSortSelect("newest-first")}
            className="py-3"
          >
            <Text className="text-gray-800 text-base">Newest First</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default TrackDailyItems;
