import React, { useEffect, useReducer, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Calendar } from "react-native-calendars"; // Calendar component
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../redux/slices/productSlice";
import Autocomplete from "react-native-autocomplete-input";
import {
  addDailyItemForCustomer,
  recordDailyItemAttendance,
  removeDailyItemForCustomer,
  updateDailyItemQuantity,
} from "../redux/slices/customerSlice";

const Attendance = ({ customer, onRefresh }) => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);
  const [productList, setProductList] = useState(products);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [quantities, setQuantities] = useState({});
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingItems, setLoadingItems] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchAllProducts());
    };

    fetchData();
  }, [dispatch]);
  

  // Filter the product list based on the user's input
  const handleSearch = (query) => {
    if (query) {
      const filtered = productList?.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
    setNewItemName(query); // Update the search input
  };

  // Ensure customer.dailyItems is initialized
  const dailyItems = customer?.dailyItems || {};

  const markedDates = {};

  // Loop through each item in dailyItems
  customer?.dailyItems?.forEach((item) => {
    item.attendance?.forEach((att) => {
      const attDateString = new Date(att.date).toISOString().split("T")[0]; // Format date to "YYYY-MM-DD"

      // Mark the date based on attendance status
      markedDates[attDateString] = {
        marked: true,
        // Use custom styles for the circle
        dotColor: att.taken ? "green" : "red",

        customStyles: {
          container: {
            backgroundColor: att.taken ? "green" : "red", // Green if taken, red if not taken
            borderRadius: 50, // Make it a circle
            width: 30, // Width of the circle
            height: 30, // Height of the circle
            justifyContent: "center",
            alignItems: "center",
          },
          text: {
            color: "white", // Text color inside the circle
          },
        },
      };
    });
  });

  // Function to handle the attendance marking
  const handleDatePress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  // Function to mark attendance for the date
  const markAttendance = async (itemName, isTaken, quantity, itemId) => {
    try {
      setLoadingItems((prev) => ({ ...prev, [itemId]: true })); // Set loading for specific item
      await dispatch(
        recordDailyItemAttendance({
          id: customer._id,
          itemName,
          date: selectedDate,
          quantity,
        })
      ).unwrap();

      // Dispatch quantity update for the daily item
      await dispatch(
        updateDailyItemQuantity({
          id: customer._id,
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

  // Function to add a new daily item
  const addNewDailyItem = async () => {
    if (!newItemName.trim() || newItemQuantity <= 0) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid item name and quantity."
      );
      return;
    }

    try {
      const response = await dispatch(
        addDailyItemForCustomer({
          id: customer._id,
          itemName: newItemName,
          quantityPerDay: newItemQuantity,
        })
      ).unwrap();

      if (response.error) {
        Alert.alert("Error", response.error || "Failed to add the daily item.");
      } else {
        Alert.alert("Success", "Item added successfully!");
        onRefresh();
        setNewItemName("");
        setNewItemQuantity("");
      }
    } catch (error) {
      Alert.alert("Error", error || "An unexpected error occurred.");
    }
  };

  const handleDeleteItem = (itemName) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete ${itemName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              // Dispatch the action and wait for the result
              await dispatch(
                removeDailyItemForCustomer({ id: customer._id, itemName })
              ).unwrap();

              Alert.alert("Success", `${itemName} has been deleted.`);
            } catch (error) {
              Alert.alert(
                "Error",
                error || "Failed to delete the item. Please try again."
              );
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleQuantityChange = (itemId, value) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemId]: value,
    }));
  };

  return (
    <View className="bg-white p-5 rounded-lg shadow-sm mb-6 border border-gray-200">
      {/* Check if there are any daily items */}

      {customer.membershipStatus === "active" ? (
        <>
          {customer && dailyItems && Object.keys(dailyItems).length > 0 ? (
            <>
              <Text className="text-lg font-semibold text-teal-700 mb-4">
                Daily Attendance
              </Text>

              {/* Calendar to pick dates */}
              <Calendar
                onDayPress={handleDatePress}
                markingType={"custom"}
                markedDates={{
                  ...markedDates,
                  [selectedDate]: { selected: true, selectedColor: "teal" },
                }}
              />

              {/* "View Full Attendance History" button */}
              <TouchableOpacity
                onPress={() => setHistoryVisible(true)} // Open full attendance history modal
                className="mt-4"
              >
                <Text className="text-blue-600 font-semibold underline">
                  View Full Attendance History
                </Text>
              </TouchableOpacity>
              <View className="mt-6">
                <Text className="text-teal-700 font-semibold mb-2">
                  Current Daily Items
                </Text>
                {customer &&
                  customer?.dailyItems.map((item, index) => (
                    <View
                      key={item._id}
                      className="flex-row justify-between items-center p-1"
                    >
                      <Text className="text-gray-800 font-semibold">
                        {item.itemName.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteItem(item.itemName.name)}
                      >
                        <Ionicons name="trash-outline" size={24} color="red" />
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            </>
          ) : (
            <View className="mt-6">
              <Text className="text-gray-500">
                No daily items available for this customer.
              </Text>
            </View>
          )}
        </>
      ) : null}

      {/* Form to add new daily item */}
      {customer.membershipStatus === "active" ? (
        <View className="mt-4">
          <Text className="text-teal-700 font-semibold mb-2">
            Search or Add New Daily Item
          </Text>

          {/* Autocomplete search bar */}
          <Autocomplete
            data={filteredProducts} // Filtered products based on search
            value={newItemName} // The value of the search bar
            onChangeText={handleSearch} // Handle the search input
            placeholder="Search or Add New Item"
            containerStyle={{
              borderWidth: 1,
              borderColor: "#D1D5DB",
              borderRadius: 8,
              padding: 5,
              paddingLeft: 8,
              marginTop: 8,
            }}
            inputContainerStyle={{
              borderWidth: 0,
            }}
            listContainerStyle={{
              padding: 0,
              margin: 0,
              borderWidth: 0,
              width: "100%",
            }}
            flatListProps={{
              keyExtractor: (item) => item._id,
              renderItem: ({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setNewItemName(item.name);
                    setFilteredProducts([]);
                  }}
                  className="p-4 w-full border-x-0 border-t border-gray-300"
                >
                  <Text className="text-gray-800">{item.name}</Text>
                </TouchableOpacity>
              ),
            }}
          />

          <TextInput
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
            placeholder="Quantity"
            keyboardType="numeric"
            className="border border-gray-300 p-3 rounded-lg mb-2 mt-2"
          />

          <TouchableOpacity
            onPress={addNewDailyItem}
            className="bg-teal-500 p-3 rounded-lg mt-4"
          >
            <Text className="text-white font-semibold text-center">
              Add Item
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text className="text-gray-500">
            Go to Edit Profile if You want to Activate Membership
          </Text>
        </View>
      )}

      {/* Modal for marking attendance */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-gray-800 bg-opacity-50">
          <View className="bg-white p-6 rounded-lg shadow-lg max-h-[90%] w-[90%]">
            <Text className="text-teal-700 font-semibold text-lg mb-4">
              Mark Attendance for {selectedDate}
            </Text>

            <ScrollView>
              {customer?.dailyItems?.map((item) => {
                const attendanceRecord = item.attendance?.find((att) => {
                  const attDateString = new Date(att.date)
                    .toISOString()
                    .split("T")[0];

                  return attDateString === selectedDate;
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
                          quantities[item.itemName._id] || item.quantityPerDay,
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

      {/* Modal for viewing full attendance history */}
      <Modal visible={isHistoryVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-gray-800 bg-opacity-50">
          <View className="bg-white p-6 rounded-lg shadow-lg w-[95%] h-[95%] overflow-y-auto">
            <Text className="text-teal-700 font-semibold text-lg mb-4">
              Full Attendance History
            </Text>

            {/* Scrollable view for attendance history */}
            <ScrollView>
              {/* Table Header */}
              <View className="flex-row justify-between border-b border-gray-300 pb-2 mb-4">
                <Text className="text-teal-800 font-semibold w-1/3">Date</Text>
                <Text className="text-teal-800 font-semibold w-1/3">Item</Text>
                <Text className="text-teal-800 font-semibold w-1/3">
                  Status
                </Text>
              </View>

              {/* Group attendance records by date */}
              {customer.dailyItems &&
                Object.entries(
                  dailyItems
                    .flatMap((item) =>
                      item.attendance.map((attendanceRecord) => ({
                        date: new Date(
                          attendanceRecord.date
                        ).toLocaleDateString(), // Format the date
                        itemName: item.itemName.name,
                        unit: item.itemName.unit,
                        attendance: attendanceRecord,
                      }))
                    )
                    .reduce((acc, record) => {
                      const { date } = record;
                      if (!acc[date]) acc[date] = [];
                      acc[date].push(record); // Group records by date
                      return acc;
                    }, {})
                )
                  .sort((a, b) => new Date(b[0]) - new Date(a[0])) // Sort by date descending
                  .map(([date, groupedRecords], i) => (
                    <View key={i} className="mb-4">
                      {/* Render the first row with the date */}
                      {groupedRecords.map((entry, j) => (
                        <View
                          key={j}
                          className="flex-row justify-between border-b border-gray-200 py-2"
                        >
                          {/* Only show date in the first entry for that date */}
                          {j === 0 ? (
                            <Text className="text-teal-800 font-semibold w-1/3 mb-2">
                              {date}
                            </Text>
                          ) : (
                            <Text className="w-1/3" /> // Leave date empty for subsequent items
                          )}

                          {/* Item Name */}
                          <Text className="w-1/3">{entry.itemName}</Text>

                          {/* Status */}
                          <Text
                            className="w-1/3"
                            style={{
                              color: entry.attendance.taken ? "green" : "red",
                              fontWeight: "bold",
                            }}
                          >
                            {entry.attendance.taken
                              ? `Taken: ${entry.attendance.quantity} ${entry.unit}`
                              : "Not Taken"}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
            </ScrollView>

            <TouchableOpacity
              className="bg-teal-500 p-3 rounded-lg mt-4"
              onPress={() => setHistoryVisible(false)}
            >
              <Text className="text-white font-semibold text-center">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Attendance;
