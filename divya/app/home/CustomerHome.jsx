import { useState, useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  View,
  Alert,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
} from "react-native";
import { EmptyState, SearchInput, EventCard, Loader } from "../../components";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllCustomers,
  fetchCustomerDetails,
  updateCreditsOfCustomer,
} from "../../redux/slices/customerSlice";
import QRCode from "react-native-qrcode-svg";
import { fetchUser } from "../../redux/slices/userSlice";

const CustomerHome = ({ user }) => {
  const dispatch = useDispatch();
  const { customers, customer, loading, error } = useSelector(
    (state) => state.customer
  );
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [partialPayment, setPartialPayment] = useState(""); // State for partial payment
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    dailyItemsCustomer: [
      { name: "Milk", status: true },
      { name: "Bread", status: false },
    ],
    creditBalance: 100,
  });

  const closeModal = () => {
    setModalVisible(false);
    setPartialPayment("");
  };

  function updateDashboardData(customers) {
    const updatedDashboardData = {
      dailyItemsCustomer: customers.flatMap((customer) =>
        Array.isArray(customer.dailyItems)
          ? customer.dailyItems.map((item) => ({
              name: item.itemName.name,
              status:
                Array.isArray(item.attendance) &&
                item.attendance.some(
                  (att) =>
                    new Date(att.date).toISOString().split("T")[0] ===
                      new Date().toISOString().split("T")[0] && att.taken
                ),
            }))
          : []
      ),

      creditBalance: customer?.creditBalance,
    };
    setDashboardData(updatedDashboardData);
  }

  const fetchData = async (customerId) => {
    await dispatch(fetchCustomerDetails(customerId));
    await dispatch(fetchAllCustomers());
  };

  const handlePaymentSelection = (method) => {
    setPaymentMethod(method);
    if (method === "credit" && !customer) {
      Alert.alert(
        "Customer Required",
        "Please select a customer for credit payment."
      );
    } else if (method === "online") {
      setShowQRCodeModal(true);
    }
  };

  const recordPayment = async () => {
    setIsLoading(true);

    if (!partialPayment || parseFloat(partialPayment) <= 0) {
      Alert.alert(
        "Invalid Payment",
        "Please enter a valid partial payment amount."
      );
      setIsLoading(false);
      return;
    }

    if (parseFloat(partialPayment) > customer.creditBalance) {
      Alert.alert(
        "Invalid Payment",
        "Partial payment cannot exceed total udhar."
      );
      setIsLoading(false);
      return;
    }

    // Calculate updated balance and determine payment status
    const updatedBalance = customer.creditBalance - parseFloat(partialPayment);
    const paymentStatus = updatedBalance === 0 ? "paid" : "partially_paid";

    // Construct payment data
    const paymentData = {
      paymentStatus,
      amountPaid: parseFloat(partialPayment),
    };

    try {
      // Await the dispatch action
      const updatedCustomer = await dispatch(
        updateCreditsOfCustomer({ customerId: customer._id, paymentData })
      ).unwrap();

      // Fetch the latest customer data
      await fetchUser(customer._id);

      Alert.alert(
        "Payment Recorded",
        `₹${partialPayment} has been paid. Remaining balance: ₹${updatedCustomer.creditBalance}`
      );

      closeModal(); // Close the modal after successful payment
    } catch (error) {
      Alert.alert("Error", error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const generateUPIQRCode = () => {
    const upiID = "8303088493@axl"; // Replace with the actual UPI ID
    return `${upiID}?amount=${customer.creditBalance}&name=Payment for Order&currency=INR`;
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(user._id);
    }, [user._id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    fetchData(user._id);
    setRefreshing(false);
  };

  useEffect(() => {
    updateDashboardData(customers);
  }, [customers]);

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col align-middle my-3 px-4 space-y-6">
          <View className="flex justify-between items-start flex-row mb-6">
            <View>
              <Text className="font-medium text-sm text-teal-700">
                Welcome Back
              </Text>
              <Text className="text-3xl font-semibold text-teal-700">
                {customer?.name}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.replace("/notifications")}>
              <View className="mt-1.5">
                <Ionicons name="notifications" size={24} color="#0f766e" />
              </View>
            </TouchableOpacity>
          </View>

          <SearchInput placeholder="Search a Product" />

          {/* Quick Actions */}
          <View className="flex flex-row flex-wrap justify-evenly mb-2">
            <ActionButton
              title="🛒 Place an Order"
              colors={["#DEF9C4", "#9CDBA6"]}
              onPress={() => router.replace("/products")}
            />
            <ActionButton
              title="📦 Track Orders"
              colors={["#9CDBA6", "#50B498"]}
              onPress={() => router.replace("/myorders")}
            />
          </View>

          {/* Outstanding Balance Section */}
          <View className="bg-white border-2 border-teal-600 rounded-lg p-4 shadow-lg mb-6">
            <Text className="text-xl font-semibold text-gray-800 mb-4">
              Udhar Balance
            </Text>

            {dashboardData.creditBalance > 0 ? (
              <View className="bg-teal-50 p-4 rounded-lg flex flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-xl text-gray-800">
                    Amount Due:
                    <Text className="font-semibold text-red-600">
                      {" "}
                      ₹{dashboardData.creditBalance}
                    </Text>
                  </Text>
                  <Text className="text-gray-600 mt-2">
                    Please clear your balance promptly to continue enjoying
                    services without interruption.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  className="bg-teal-600 hover:bg-teal-700 rounded-full px-5 py-2 ml-4"
                >
                  <Text className="text-white font-semibold">Pay Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text className="text-gray-500 text-center py-4">
                You have no outstanding balance. Thank you for staying up to
                date!
              </Text>
            )}
          </View>

          {/* Daily Item Tracking */}
          <View className="bg-white border-2 border-teal-600 rounded-lg p-4 shadow-lg mb-6">
            <Text className="text-xl font-semibold text-gray-800 mb-4">
              Daily Item Tracking
            </Text>
            {dashboardData.dailyItemsCustomer.length > 0 ? (
              dashboardData.dailyItemsCustomer.map((item, index) => (
                <View
                  key={index}
                  className="flex flex-row justify-between items-center py-2 border-b border-gray-300"
                >
                  <Text className="text-gray-700">{item.name}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      alert(
                        `${item.name} is ${
                          item.status ? "delivered" : "pending"
                        }`
                      )
                    }
                  >
                    <Text
                      className={`text-lg ${
                        item.status ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.status ? "✅" : "❌"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 text-center py-4">
                No items to track today.
              </Text>
            )}
          </View>
        </View>

        {/* Modal for managing payments */}
        {isModalVisible && (
          <Modal visible={isModalVisible} transparent animationType="slide">
            <View className="flex-1 justify-center items-center bg-gray-800 bg-opacity-50">
              <View className="bg-white p-8 rounded-lg shadow-lg max-h-[90%] w-[90%]">
                <Text className="text-teal-700 font-semibold text-xl mb-6 text-center">
                  Manage Udhar for {customer.name}
                </Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Total Udhar: ₹{customer.creditBalance}
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
                      isLoading ? "bg-gray-400" : "bg-green-600"
                    }`}
                    onPress={!isLoading ? recordPayment : null} // Disable button if loading
                    disabled={isLoading} // Disable button if loading
                  >
                    {isLoading ? (
                      <Text className="text-white text-center text-lg font-semibold">
                        Recording...
                      </Text>
                    ) : (
                      <Text className="text-white text-center text-lg font-semibold">
                        Record Payment
                      </Text>
                    )}
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
                          ₹{user.creditBalance}
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
      </ScrollView>
    </SafeAreaView>
  );
};

const ActionButton = ({ title, colors, onPress }) => (
  <LinearGradient
    colors={colors}
    className="rounded-lg p-4 my-1 mx-1 w-5/12"
    style={{ elevation: 2 }}
  >
    <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
      <Text className="text-white text-center font-bold">{title}</Text>
    </TouchableOpacity>
  </LinearGradient>
);

export default CustomerHome;
