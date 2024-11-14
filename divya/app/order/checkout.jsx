import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { router, useLocalSearchParams } from "expo-router";
import { createOrder } from "../../redux/slices/orderSlice";
import { initiatePayment } from "../../redux/slices/paymentSlice";

const CheckoutScreen = () => {
  const dispatch = useDispatch();
  const { data } = useLocalSearchParams();
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const [selectedAddress, setSelectedAddress] = useState({
    street: user.address.street,
    city: user.address.city,
    state: user.address.state,
    postalCode: user.address.postalCode,
    country: user.address.country,
  });

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    if (data) {
      const parsedData = JSON.parse(data);
      setCheckoutData(parsedData);
    }
  }, [data]);

  const items = checkoutData?.items || [];
  const totalAmount = checkoutData?.totalAmount || 0;

  const handlePayNow = async () => {
    if (!selectedAddress || !paymentMethod) {
      Alert.alert(
        "Missing Information",
        "Please select an address and payment method."
      );
      return;
    }

    setLoading(true);

    const orderData = {
      customerId: user._id,
      deliveryAddress: selectedAddress,
      paymentMethod,
      totalAmount,
    };

    try {
      const orderResponse = await dispatch(createOrder(orderData)).unwrap();
      console.log("order created");
      const paymentData = {
        orderId: orderResponse._id,
        customerId: user._id,
        paymentMethod,
      };

      await dispatch(initiatePayment(paymentData)).unwrap();

      router.push("/order/order-confirmation");
    } catch (error) {
      Alert.alert("Error", error.message || "Payment processing failed.");
    } finally {
      setLoading(false);
    }
  };

  const addNewAddress = () => {
    const { street, city, state, postalCode, country } = newAddress;
    if (street && city && state && postalCode && country) {
      setSelectedAddress(newAddress);
      setNewAddress({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      });
      setModalVisible(false);
    } else {
      Alert.alert("Error", "Please fill in all address fields.");
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="px-4 mt-4 space-y-6">
          {/* Back Button & Title */}
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() =>
                router.canGoBack() ? router.back() : router.push("/home")
              }
              style={{ marginRight: 5 }}
            >
              <Ionicons name="chevron-back" size={28} color="teal" />
            </TouchableOpacity>
            <Text className="text-2xl font-semibold text-teal-700">
              Check Out
            </Text>
          </View>

          {/* Order Summary */}
          <View className="space-y-2">
            <Text className="text-xl font-semibold text-teal-700">
              Order Summary
            </Text>
            {items.map((item, index) => (
              <View
                key={index}
                className="flex-row justify-between p-4 border border-gray-300 rounded-lg"
              >
                <Text className="text-sm text-gray-700">
                  {item.productId.name} (x{item.quantity})
                </Text>
                <Text className="text-sm text-gray-700">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            <Text className="text-lg font-psemibold text-teal-700 text-right">
              Total Amount: ₹{totalAmount.toFixed(2)}
            </Text>
          </View>

          {/* Existing Delivery Address */}
          <View className="space-y-2">
            <Text className="text-xl font-semibold text-teal-700">
              Delivery Address
            </Text>
            <View className="p-4 border border-gray-300 rounded-lg">
              <Text className="text-sm text-gray-700">
                {selectedAddress.street}
              </Text>
              <Text className="text-sm text-gray-700">
                {selectedAddress.city}, {selectedAddress.state}
              </Text>
              <Text className="text-sm text-gray-700">
                {selectedAddress.postalCode}, {selectedAddress.country}
              </Text>
            </View>
          </View>

          {/* New Address Button */}
          <View className="space-y-2">
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text className="text-teal-600 text-right font-bold underline">
                Add New Address
              </Text>
            </TouchableOpacity>
          </View>

          {/* Delivery Policy Message */}
          <View className="p-4 border border-red-300 bg-red-50 rounded-lg">
            <Text className="text-sm text-red-600">
              Delivery is currently closed. Only customers with membership can
              have products delivered to their doorstep. Irregular users must
              pick up their orders from the shop.
            </Text>
          </View>

          {/* Payment Options */}
          <View className="space-y-2">
            <Text className="text-xl font-semibold text-teal-700">
              Payment Options
            </Text>
            {["UPI", "Credit/Debit Card", "Net Banking", "Wallet"].map(
              (method, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setPaymentMethod(method)}
                  className={`p-4 border border-gray-300 rounded-lg ${
                    paymentMethod === method ? "border-teal-600" : ""
                  }`}
                >
                  <Text className="text-sm text-gray-700">{method}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </ScrollView>

      {/* Pay Now Button */}
      <View className="bg-white border-t border-gray-300 shadow-lg py-4 px-6 w-full flex-row justify-between items-center">
        <Text className="text-lg font-semibold text-gray-800">
          Total: ₹{cart.totalAmount?.toFixed(2)}
        </Text>

        <TouchableOpacity
          onPress={handlePayNow}
          className="bg-teal-600 py-3 px-6 rounded-lg shadow-md shadow-teal-800 active:scale-95 transition-all duration-150 flex-row items-center"
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons
                name="card-outline"
                size={24}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-bold text-lg tracking-wide">
                Pay Now
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal for Adding New Address */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-lg p-6 w-4/5">
            <Text className="text-lg font-semibold text-teal-700 mb-4">
              Enter New Address
            </Text>
            <TextInput
              value={newAddress.street}
              onChangeText={(text) =>
                setNewAddress((prev) => ({ ...prev, street: text }))
              }
              placeholder="Street"
              className="border border-gray-300 rounded-lg p-3 mb-2"
            />
            <TextInput
              value={newAddress.city}
              onChangeText={(text) =>
                setNewAddress((prev) => ({ ...prev, city: text }))
              }
              placeholder="City"
              className="border border-gray-300 rounded-lg p-3 mb-2"
            />
            <TextInput
              value={newAddress.state}
              onChangeText={(text) =>
                setNewAddress((prev) => ({ ...prev, state: text }))
              }
              placeholder="State"
              className="border border-gray-300 rounded-lg p-3 mb-2"
            />
            <TextInput
              value={newAddress.postalCode}
              onChangeText={(text) =>
                setNewAddress((prev) => ({ ...prev, postalCode: text }))
              }
              placeholder="Postal Code"
              className="border border-gray-300 rounded-lg p-3 mb-2"
            />
            <TextInput
              value={newAddress.country}
              onChangeText={(text) =>
                setNewAddress((prev) => ({ ...prev, country: text }))
              }
              placeholder="Country"
              className="border border-gray-300 rounded-lg p-3 mb-4"
            />
            <TouchableOpacity
              onPress={addNewAddress}
              className="bg-teal-600 py-2 px-4 rounded-lg shadow-md shadow-teal-800"
            >
              <Text className="text-white text-center font-bold">
                Save Address
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="mt-2"
            >
              <Text className="text-teal-600 text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CheckoutScreen;
