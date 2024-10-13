import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchInput } from "../components"; // Assuming you have a search component
import { router } from "expo-router";
import QRCode from "react-native-qrcode-svg";

const CustomerCreditScreen = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);

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

  const [searchCustomer, setSearchCustomer] = useState(
    customerList.filter((customer) => customer.creditBalance > 0)
  );

  const openModal = (customer) => {
    setSelectedCustomer(customer);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCustomer(null);
  };

  const sendReminder = (selectedCustomer) => {
    alert(`Reminder sent to ${selectedCustomer.name}`);
  };

  const remindAllCustomers = () => {
    // searchCustomer.forEach((customer) => sendReminder(customer));
    alert("Reminders sent to all customers with outstanding udhar.");
  };

  const handlePaymentSelection = (method) => {
    setPaymentMethod(method);
    if (method === "credit" && !selectedCustomer) {
      Alert.alert(
        "Customer Required",
        "Please select a customer for credit payment."
      );
    } else if (method === "online") {
      setShowQRCodeModal(true); // Ensure `setShowQRCodeModal` is defined if you're using it
    }
  };

  const recordPayment = () => {
    // Logic to record payment based on selectedPayment
    // For example, decrease credit balance if payment method is credit
    alert("Payment recorded");
    closeModal();
  };

  const generateUPIQRCode = () => {
    const upiID = "8303088493@axl"; // Replace with the actual UPI ID
    return `${upiID}?amount=${selectedCustomer.creditBalance}&name=Payment for Order&currency=INR`;
  };

  const renderCustomer = ({ item: customer }) => (
    <TouchableOpacity
      onPress={() => openModal(customer)}
      className="py-3 px-4 mb-3 rounded-lg shadow-sm flex-row items-center justify-between"
    >
      <View className="flex-1">
        <Text className="text-lg font-semibold text-teal-700">
          {customer.name}
        </Text>
        <Text className="text-sm text-gray-500">{customer.phone}</Text>
        <Text className="text-sm text-gray-400">
          {customer.address.city}, {customer.address.state},{" "}
          {customer.address.country}
        </Text>
        <Text className="text-lg font-bold text-red-600">
          ₹{customer.creditBalance}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="gray" />
    </TouchableOpacity>
  );

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
            Track Udhar/Borrowing
          </Text>
        </View>

        {/* Search Input */}
        <SearchInput
          customers={customerList.filter(
            (customer) => customer.creditBalance > 0
          )}
          setFilteredResults={setSearchCustomer}
          placeholder="Search for a customer"
        />

        <View className="flex flex-row justify-between items-center my-4 ">
          {/* Customers Count */}
          <Text className="text-gray-800 font-semibold text-lg">
            {searchCustomer.length} Customers
          </Text>

          {/* Filter & Sort Buttons */}
          <View className="flex flex-row space-x-3">
            <TouchableOpacity
              className="flex flex-row items-center border border-teal-600 rounded-lg py-2 px-3"
              onPress={() => alert("Sort Products")}
            >
              <Ionicons name="swap-vertical" size={18} color="#50B498" />
              <Text className="ml-1 text-teal-600 font-semibold">Sort</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex flex-row items-center border border-teal-600 rounded-lg py-2 px-3"
              onPress={remindAllCustomers}
            >
              <Ionicons name="megaphone-outline" size={18} color="#50B498" />
              <Text className="ml-1 text-teal-600 font-semibold">
                Remind All
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Customer List using FlatList */}
        {searchCustomer.length > 0 ? (
          <FlatList
            data={searchCustomer}
            renderItem={renderCustomer}
            keyExtractor={(item) => item.phone}
            ListEmptyComponent={() => (
              <Text className="text-gray-600 italic mt-2">
                No customers found.
              </Text>
            )}
          />
        ) : (
          <Text className="text-gray-600 italic mt-2">No customers found.</Text>
        )}

        {/* Modal for managing payments */}
        {selectedCustomer && isModalVisible && (
          <Modal visible={isModalVisible} transparent animationType="slide">
            <View className="flex-1 justify-center items-center bg-gray-800 bg-opacity-50">
              <View className="bg-white p-8 rounded-lg shadow-lg max-h-[90%] w-[90%]">
                {/* Modal Title */}
                <Text className="text-teal-700 font-semibold text-xl mb-6 text-center">
                  Manage Udhar for {selectedCustomer.name}
                </Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Total Udhar Display */}
                  <Text className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Total Udhar: ₹{selectedCustomer.creditBalance}
                  </Text>

                  {/* Payment Method Selection */}
                  <View className="mb-8">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                      Payment Method
                    </Text>
                    <View className="flex-row justify-around">
                      {["online", "cash"].map((method) => (
                        <TouchableOpacity
                          key={method}
                          onPress={() => handlePaymentSelection(method)}
                          className={`py-3 px-5 flex-row items-center rounded-lg shadow ${
                            paymentMethod === method
                              ? "bg-teal-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <Ionicons
                            name={method === "online" ? "card" : "cash"}
                            size={24}
                            color="white"
                          />
                          <Text className="ml-2 text-white font-semibold capitalize">
                            {method}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  {/* Record Payment Button */}
                  <TouchableOpacity
                    className="mt-6 bg-green-600 p-4 rounded-lg shadow-lg transition-transform transform active:scale-95"
                    onPress={recordPayment} // Call your new recordPayment function
                  >
                    <Text className="text-white text-center text-lg font-semibold">
                      Record Payment
                    </Text>
                  </TouchableOpacity>

                  {/* Send SMS Reminder Button */}
                  <TouchableOpacity
                    className="mt-4 bg-orange-600 p-4 rounded-lg shadow-lg transition-transform transform active:scale-95 flex-row items-center justify-center"
                    onPress={() => {
                      sendReminder(selectedCustomer);
                      closeModal();
                    }}
                  >
                    <Ionicons
                      name="megaphone-outline"
                      size={22}
                      color="#ffffff"
                    />
                    <Text className="text-white text-center text-lg font-semibold ml-2">
                      Remind {selectedCustomer.name}
                    </Text>
                  </TouchableOpacity>

                  {/* QR Code Modal for Online Payment */}
                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showQRCodeModal}
                    onRequestClose={() => setShowQRCodeModal(false)}
                  >
                    <View className="flex-1 justify-center items-center bg-black bg-opacity-70">
                      <View className="bg-white rounded-lg shadow-lg p-6 w-4/5">
                        <Text className="text-2xl font-bold text-teal-700 mb-4 text-center">
                          Scan to Pay
                        </Text>
                        <View className="flex items-center justify-center mb-4">
                          <QRCode
                            value={generateUPIQRCode()}
                            size={200}
                            bgColor="white"
                            fgColor="teal"
                          />
                        </View>
                        <Text className="text-gray-800 mt-4 text-center">
                          Scan this QR code to pay
                        </Text>
                        <Text className="text-3xl font-bold text-teal-800 text-center mt-2 mb-4 p-2 border border-teal-600 bg-teal-100 rounded-lg">
                          ₹{selectedCustomer.creditBalance}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowQRCodeModal(false)}
                          className="bg-teal-600 mt-6 p-4 rounded-lg"
                        >
                          <Text className="text-white text-center font-semibold">
                            Close
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>

                  {/* Close Modal Button */}
                  <TouchableOpacity
                    className="mt-6 bg-gray-600 p-4 rounded-lg"
                    onPress={closeModal}
                  >
                    <Text className="text-white text-center font-semibold">
                      Close
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerCreditScreen;
