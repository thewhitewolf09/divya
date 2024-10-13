import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchInput } from "../components";
import { router } from "expo-router";

const TrackDailyItems = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [quantities, setQuantities] = useState({});

  const [customerList, setCustomerList] = useState([
    {
      name: "John Doe",
      phone: "8303088493",
      whatsappNumber: "8303088493",
      address: {
        street: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India",
      },
      udharBalance: 500,
      isActive: true,
      membershipStatus: "active",
      dailyItems: {
        Milk: {
          quantityPerDay: 1,
          attendance: {
            "2024-09-20": { taken: true, quantity: 1, price: 50 },
            "2024-09-21": { taken: false, quantity: 0, price: 0 },
            "2024-09-22": { taken: true, quantity: 1, price: 50 },
            "2024-09-23": { taken: true, quantity: 1, price: 50 },
          },
        },
        BadamJuice: {
          quantityPerDay: 1,
          attendance: {
            "2024-09-20": { taken: true, quantity: 1, price: 50 },
            "2024-09-21": { taken: false, quantity: 0, price: 0 },
            "2024-09-22": { taken: true, quantity: 1, price: 50 },
            "2024-09-23": { taken: false, quantity: 0, price: 0 },
          },
        },
        Paneer: {
          quantityPerDay: 0.5,
          attendance: {
            "2024-09-20": { taken: true, quantity: 0.5, price: 70 },
            "2024-09-21": { taken: true, quantity: 0.5, price: 70 },
            "2024-09-22": { taken: false, quantity: 0, price: 0 },
            "2024-09-23": { taken: true, quantity: 0.5, price: 70 },
          },
        },
        Fruits: {
          quantityPerDay: 2,
          attendance: {
            "2024-09-20": { taken: true, quantity: 2, price: 30 },
            "2024-09-21": { taken: true, quantity: 2, price: 30 },
            "2024-09-22": { taken: true, quantity: 2, price: 30 },
            "2024-09-23": { taken: false, quantity: 0, price: 0 },
            "2024-09-24": { taken: true, quantity: 2, price: 30 },
            "2024-09-25": { taken: true, quantity: 2, price: 30 },
            "2024-09-26": { taken: true, quantity: 2, price: 30 },
            "2024-09-27": { taken: false, quantity: 0, price: 0 },
            "2024-09-28": { taken: true, quantity: 2, price: 30 },
            "2024-09-29": { taken: true, quantity: 2, price: 30 },
            "2024-09-30": { taken: true, quantity: 2, price: 30 },
            "2024-09-31": { taken: false, quantity: 0, price: 0 },
          },
        },
      },
      totalPurchases: 5000,
      registrationDate: "2023-09-01",
      creditBalance: 300,
    },
    {
      name: "Jane Smith",
      phone: "9123456789",
      whatsappNumber: "9123456789",
      address: {
        street: "456 Elm St",
        city: "Pune",
        state: "Maharashtra",
        postalCode: "411001",
        country: "India",
      },
      udharBalance: 200,
      isActive: true,
      membershipStatus: "active",
      dailyItems: {
        Milk: {
          quantityPerDay: 1,
          attendance: {
            "2024-09-20": { taken: true, quantity: 1, price: 50 },
            "2024-09-21": { taken: true, quantity: 1, price: 50 },
            "2024-09-22": { taken: true, quantity: 1, price: 50 },
            "2024-09-23": { taken: false, quantity: 0, price: 0 },
          },
        },
        Fruits: {
          quantityPerDay: 3,
          attendance: {
            "2024-09-20": { taken: true, quantity: 3, price: 90 },
            "2024-09-21": { taken: true, quantity: 3, price: 90 },
            "2024-09-22": { taken: false, quantity: 0, price: 0 },
            "2024-09-23": { taken: true, quantity: 3, price: 90 },
          },
        },
      },
      totalPurchases: 3000,
      registrationDate: "2023-09-05",
      creditBalance: 150,
    },
    {
      name: "Raj Patel",
      phone: "9876543210",
      whatsappNumber: "9876543210",
      address: {
        street: "789 Pine St",
        city: "Delhi",
        state: "Delhi",
        postalCode: "110001",
        country: "India",
      },
      udharBalance: 1000,
      isActive: true,
      membershipStatus: "active",
      dailyItems: {
        Paneer: {
          quantityPerDay: 1,
          attendance: {
            "2024-09-20": { taken: true, quantity: 1, price: 70 },
            "2024-09-21": { taken: false, quantity: 0, price: 0 },
            "2024-09-22": { taken: true, quantity: 1, price: 70 },
            "2024-09-23": { taken: true, quantity: 1, price: 70 },
          },
        },
        BadamJuice: {
          quantityPerDay: 2,
          attendance: {
            "2024-09-20": { taken: true, quantity: 2, price: 100 },
            "2024-09-21": { taken: true, quantity: 2, price: 100 },
            "2024-09-22": { taken: true, quantity: 2, price: 100 },
            "2024-09-23": { taken: false, quantity: 0, price: 0 },
          },
        },
      },
      totalPurchases: 7000,
      registrationDate: "2023-09-10",
      creditBalance: 200,
    },
    {
      name: "Anita Rao",
      phone: "9988776655",
      whatsappNumber: "9988776655",
      address: {
        street: "321 Maple St",
        city: "Bangalore",
        state: "Karnataka",
        postalCode: "560001",
        country: "India",
      },
      udharBalance: 0,
      isActive: true,
      membershipStatus: "inactive",
      dailyItems: {
        Fruits: {
          quantityPerDay: 5,
          attendance: {
            "2024-09-20": { taken: true, quantity: 5, price: 150 },
            "2024-09-21": { taken: true, quantity: 5, price: 150 },
            "2024-09-22": { taken: true, quantity: 5, price: 150 },
            "2024-09-23": { taken: true, quantity: 5, price: 150 },
          },
        },
      },
      totalPurchases: 4500,
      registrationDate: "2023-09-15",
      creditBalance: 50,
    },
    {
      name: "Karan Singh",
      phone: "9876543211",
      whatsappNumber: "9876543211",
      address: {
        street: "654 Oak St",
        city: "Chennai",
        state: "Tamil Nadu",
        postalCode: "600001",
        country: "India",
      },
      udharBalance: 250,
      isActive: true,
      membershipStatus: "active",
      dailyItems: {
        Milk: {
          quantityPerDay: 1,
          attendance: {
            "2024-09-20": { taken: false, quantity: 0, price: 0 },
            "2024-09-21": { taken: true, quantity: 1, price: 50 },
            "2024-09-22": { taken: true, quantity: 1, price: 50 },
            "2024-09-23": { taken: true, quantity: 1, price: 50 },
          },
        },
        Paneer: {
          quantityPerDay: 0.5,
          attendance: {
            "2024-09-20": { taken: true, quantity: 0.5, price: 70 },
            "2024-09-21": { taken: false, quantity: 0, price: 0 },
            "2024-09-22": { taken: true, quantity: 0.5, price: 70 },
            "2024-09-23": { taken: true, quantity: 0.5, price: 70 },
          },
        },
      },
      totalPurchases: 3200,
      registrationDate: "2023-09-20",
      creditBalance: 100,
    },
  ]);

  const [searchCustomer, setSearchCustomer] = useState(customerList);

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

  const markAttendance = (itemName, isTaken, quantity) => {
    setQuantities((prev) => ({
      ...prev,
      [itemName]: isTaken ? quantity : 0,
    }));
  };

  const submitAttendance = () => {
    if (selectedCustomer) {
      const updatedCustomerList = customerList.map((customer) => {
        if (customer.phone === selectedCustomer.phone) {
          const updatedDailyItems = { ...customer.dailyItems };
          Object.keys(quantities).forEach((itemName) => {
            const today = new Date().toISOString().split("T")[0]; // Today's date in YYYY-MM-DD format
            updatedDailyItems[itemName].attendance[today] = {
              taken: quantities[itemName] > 0,
              quantity: quantities[itemName],
              price: updatedDailyItems[itemName].quantityPerDay * 50, // Example price, adjust accordingly
            };
          });
          return { ...customer, dailyItems: updatedDailyItems };
        }
        return customer;
      });

      setCustomerList(updatedCustomerList);
      setSearchCustomer(updatedCustomerList);
      setModalVisible(false);
    }
  };

  const isAttendanceComplete = (customer) => {
    const dailyItems = customer.dailyItems;
    const totalItems = Object.keys(dailyItems).length;
    const takenItems = Object.keys(dailyItems).reduce((acc, itemName) => {
      const attendance = Object.values(dailyItems[itemName].attendance);
      const lastEntry = attendance[attendance.length - 1]; // Assume last entry is for today
      return lastEntry?.taken ? acc + 1 : acc;
    }, 0);
    return totalItems === takenItems;
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView className="p-4">
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
          customers={customerList}
          setFilteredResults={setSearchCustomer}
          placeholder="Search for a customer"
        />

        <View className="flex flex-row justify-between items-center my-4 ">
          {/* Products Count */}
          <Text className="text-gray-800 font-semibold text-lg">
            {searchCustomer.length} Customers
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
        {searchCustomer.length > 0 ? (
          searchCustomer.map((customer) => {
            const totalItems = Object.keys(customer.dailyItems).length;
            const isComplete = isAttendanceComplete(customer);
            const backgroundColor = isComplete ? "bg-green-100" : "bg-red-100";
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
                    {customer.phone}
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
                  Mark Attendance for {selectedCustomer.name}
                </Text>

                <ScrollView>
                  {Object.keys(selectedCustomer.dailyItems).map((itemName) => (
                    <View key={itemName} className="mb-4">
                      <Text className="text-teal-800 font-semibold text-md mb-2">
                        {itemName}
                      </Text>
                      <TextInput
                        value={quantities[itemName]?.toString() || ""}
                        onChangeText={(value) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [itemName]: Number(value) || 0, // Convert to number
                          }))
                        }
                        placeholder="Enter Quantity"
                        keyboardType="numeric"
                        className="border border-gray-300 p-2 rounded-lg mb-2"
                      />
                      <TouchableOpacity
                        className="flex-row justify-between items-center mb-2 bg-green-100 p-2 rounded-lg"
                        onPress={() => {
                          markAttendance(itemName, true, quantities[itemName]);
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
                          markAttendance(itemName, false, 0);
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
                  ))}
                </ScrollView>

                <TouchableOpacity
                  className="bg-teal-500 p-3 rounded-lg mt-4"
                  onPress={submitAttendance}
                >
                  <Text className="text-white font-semibold text-center">
                    Submit Attendance
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="p-2 mt-2"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-red-500 text-center">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrackDailyItems;
