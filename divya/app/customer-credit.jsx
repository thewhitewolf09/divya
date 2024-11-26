import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchInput } from "../components"; // Assuming you have a search component
import { router, useFocusEffect } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllCustomers,
  updateCreditsOfCustomer,
} from "../redux/slices/customerSlice";
import SortComponentCustomer from "../components/SortComponentCustomer";

const CustomerCreditScreen = () => {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.customer);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [partialPayment, setPartialPayment] = useState(""); // State for partial payment
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);

  const [searchCustomer, setSearchCustomer] = useState(
    customers.filter((customer) => customer?.creditBalance > 0)
  );

   // References to control the bottom sheet
   const [activeSheet, setActiveSheet] = useState(null);
   const sortSheetRef = useRef(null);
   const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);
 
   // Function to toggle the sort bottom sheet
   const handleOpenSort = () => {
     setActiveSheet("sort");
     sortSheetRef.current?.expand();
   };


  const openModal = (customer) => {
    setSelectedCustomer(customer);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCustomer(null);
    setPartialPayment(""); // Reset partial payment when modal closes
  };

  const sendReminder = async (selectedCustomer) => {
    if (!selectedCustomer.deviceToken) {
      alert("No push token available for this customer.");
      return;
    }

    const message = {
      to: selectedCustomer.deviceToken,
      sound: "default",
      title: `Reminder for ${selectedCustomer.name}`,
      body: `Hello ${selectedCustomer.name}, just a reminder!`,
      data: { customData: "any data", targetScreen: "/notifications" }, 
    };

    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Accept-encoding": "gzip, deflate",
        },
        body: JSON.stringify(message),
      });


      if (response.ok) {
        
        alert(`Reminder sent to ${selectedCustomer.name}`);
      } else {
        alert(`Failed to send reminder to ${selectedCustomer.name}`);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("An error occurred while sending the reminder.");
    }
  };

  const remindAllCustomers = () => {
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
      setShowQRCodeModal(true);
    }
  };

  const recordPayment = () => {
    if (!partialPayment || parseFloat(partialPayment) <= 0) {
      Alert.alert(
        "Invalid Payment",
        "Please enter a valid partial payment amount."
      );
      return;
    }

    if (parseFloat(partialPayment) > selectedCustomer.creditBalance) {
      Alert.alert(
        "Invalid Payment",
        "Partial payment cannot exceed total udhar."
      );
      return;
    }

    // Calculate updated balance and determine payment status
    const updatedBalance =
      selectedCustomer.creditBalance - parseFloat(partialPayment);
    const paymentStatus = updatedBalance === 0 ? "paid" : "partially_paid";

    // Construct payment data
    const paymentData = {
      paymentStatus,
      amountPaid: parseFloat(partialPayment),
    };

    // Dispatch the updateCreditsOfCustomer action with customerId and paymentData
    dispatch(
      updateCreditsOfCustomer({ customerId: selectedCustomer._id, paymentData })
    )
      .unwrap()
      .then((updatedCustomer) => {
        // Retrieve the updated customer from the response and show remaining balance
        Alert.alert(
          "Payment Recorded",
          `₹${partialPayment} has been paid. Remaining balance: ₹${updatedCustomer.creditBalance}`
        );
        closeModal(); // Close the modal after successful payment
      })
      .catch((error) => {
        // Show error if the payment update fails
        Alert.alert("Error", error);
      });
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
        <Text className="text-sm text-gray-500">{customer.mobile}</Text>
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

  return (
    <SafeAreaView className="bg-white h-full">
      <View
        className="p-4"
   
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
            Track Udhar/Borrowing
          </Text>
        </View>

        {/* Search Input */}
        <SearchInput
          customers={customers.filter((customer) => customer.creditBalance > 0)}
          setFilteredResults={setSearchCustomer}
          placeholder="Search for a customer"
        />

        <View className="flex flex-row justify-between items-center my-4">
          <Text className="text-gray-800 font-semibold text-lg">
            {searchCustomer.length} Customers
          </Text>

          <View className="flex flex-row space-x-3">
            <TouchableOpacity
              className="flex flex-row items-center border border-teal-600 rounded-lg py-2 px-3"
              onPress={handleOpenSort}
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

        {searchCustomer.length > 0 ? (
          <FlatList
            data={searchCustomer}
            renderItem={renderCustomer}
            keyExtractor={(item) => item.phone}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
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
                <Text className="text-teal-700 font-semibold text-xl mb-6 text-center">
                  Manage Udhar for {selectedCustomer.name}
                </Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Total Udhar: ₹{selectedCustomer.creditBalance}
                  </Text>

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

                  {paymentMethod !== "" ? (
                    <View className="mb-8">
                      <Text className="text-lg font-semibold text-gray-800 mb-4">
                        Enter Partial Payment Amount
                      </Text>
                      <TextInput
                        value={partialPayment}
                        onChangeText={setPartialPayment}
                        keyboardType="numeric"
                        placeholder="Enter amount"
                        className="border border-gray-300 rounded-lg p-4 text-lg"
                      />
                    </View>
                  ) : null}

                  <TouchableOpacity
                    className={`mt-6 p-4 rounded-lg shadow-lg transition-transform transform active:scale-95 ${
                      loading ? "bg-gray-400" : "bg-green-600"
                    }`}
                    onPress={!loading ? recordPayment : null} // Disable button if loading
                    disabled={loading} // Disable button if loading
                  >
                    {loading ? (
                      <Text className="text-white text-center text-lg font-semibold">
                        Recording...
                      </Text>
                    ) : (
                      <Text className="text-white text-center text-lg font-semibold">
                        Record Payment
                      </Text>
                    )}
                  </TouchableOpacity>

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
      </View>

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

export default CustomerCreditScreen;
