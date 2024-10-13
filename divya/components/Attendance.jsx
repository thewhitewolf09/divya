import React, { useEffect, useReducer, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars"; // Calendar component
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../redux/slices/productSlice";
import Autocomplete from "react-native-autocomplete-input";
import {
  addDailyItemForCustomer,
  removeDailyItemForCustomer,
} from "../redux/slices/customerSlice";

const Attendance = ({ customer }) => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);
  const [productList, setProductList] = useState(products);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [itemQuantities, setItemQuantities] = useState({});
  const [customQuantity, setCustomQuantity] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchAllProducts());
    };

    fetchData();
  }, []);

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

  // Function to handle the attendance marking
  const handleDatePress = (day) => {
    setSelectedDate(day.dateString); // Set selected date
    setModalVisible(true); // Show modal for attendance
  };

  // Function to mark attendance for the date
  const markAttendance = (itemName, isTaken, quantity) => {
    // Initialize dailyItems if it doesn't exist
    if (!dailyItems[itemName]) {
      dailyItems[itemName] = { attendance: {} };
    }

    if (isTaken) {
      const currentAttendance = dailyItems[itemName].attendance[
        selectedDate
      ] || {
        taken: false,
        quantity: 0,
      };
      currentAttendance.taken = true;
      currentAttendance.quantity = quantity; // Update the quantity taken
      dailyItems[itemName].attendance[selectedDate] = currentAttendance;
    } else {
      dailyItems[itemName].attendance[selectedDate] = {
        taken: false,
        quantity: 0,
      };
    }

    setModalVisible(false); // Close the modal after marking
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

  return (
    <View className="bg-white p-5 rounded-lg shadow-sm mb-6 border border-gray-200">
      {/* Check if there are any daily items */}

      {customer && dailyItems && Object.keys(dailyItems).length > 0 ? (
        <>
          <Text className="text-lg font-semibold text-teal-700 mb-4">
            Daily Attendance
          </Text>

          {/* Calendar to pick dates */}
          <Calendar
            onDayPress={handleDatePress}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: "teal" }, // Mark selected date
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
              dailyItems.map((item, index) => (
                <View
                  key={item._id}
                  className="flex-row justify-between items-center p-1"
                >
                  <Text className="text-gray-800 font-semibold">
                    {item.itemName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item.itemName)}
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

            {/* Scrollable content to prevent overflow */}
            <ScrollView>
              {/* Loop through the daily items */}
              {customer?.dailyItems?.map((item, index) => {
                // Find the attendance record for the selected date
                const attendanceForDate = item.attendance.find(
                  (attendanceItem) =>
                    new Date(attendanceItem.date).toDateString() ===
                    new Date(selectedDate).toDateString()
                );

                // Set the default quantity based on the attendance record for the selected date
                const defaultQuantity = attendanceForDate?.quantity || "";
                

                return (
                  <View key={item._id} className="mb-4">
                    <Text className="text-teal-800 font-semibold text-md mb-2">
                      {item.itemName}({defaultQuantity})
                    </Text>

                    <TextInput
                      value={customQuantity}
                      onChangeText={setCustomQuantity}
                      placeholder="Enter Quantity"
                      keyboardType="numeric"
                      className="border border-gray-300 p-2 rounded-lg mb-2"
                    />

                    <TouchableOpacity
                      className="flex-row justify-between items-center mb-2 bg-green-100 p-2 rounded-lg"
                      onPress={() => {
                        markAttendance(
                          item.itemName,
                          true,
                          customQuantity || defaultQuantity
                        );
                        setCustomQuantity(""); // Clear the input field after submission
                      }}
                    >
                      <Text className="text-green-600 font-semibold">
                        Mark Taken
                      </Text>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={24}
                        color="green"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row justify-between items-center bg-red-100 p-2 rounded-lg"
                      onPress={() => {
                        markAttendance(item.itemName, false, 0);
                        setCustomQuantity(""); // Clear the input field after submission
                      }}
                    >
                      <Text className="text-red-600 font-semibold">
                        Not Taken
                      </Text>
                      <Ionicons
                        name="close-circle-outline"
                        size={24}
                        color="red"
                      />
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

              {/* Display full attendance history date-wise */}
              {Object.keys(dailyItems)
                .flatMap((itemName) => {
                  // Get the attendance entries with dates
                  return Object.entries(
                    dailyItems[itemName].attendance || {}
                  ).map(([date, attendance]) => ({
                    date,
                    itemName,
                    attendance,
                  }));
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending
                .map((entry, i) => (
                  <View
                    key={i}
                    className="flex-row justify-between border-b border-gray-200 py-2"
                  >
                    <Text className="w-1/3">{entry.date}</Text>
                    <Text className="w-1/3">{entry.itemName}</Text>
                    <Text
                      className="w-1/3"
                      style={{
                        color: entry.attendance.taken ? "green" : "red",
                        fontWeight: "bold",
                      }} // Change color based on taken status
                    >
                      {entry.attendance.taken
                        ? `Taken: ${entry.attendance.quantity} liters`
                        : "Not Taken"}
                    </Text>
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
