import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  Button,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { CustomButton, SearchInput } from "../../components";
import { useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";

const BillGenerationScreen = () => {
  const { selectedProducts } = useLocalSearchParams();
  const parsedProducts = JSON.parse(selectedProducts || "[]");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [customer, setCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [products, setProducts] = useState(
    parsedProducts.map((product) => ({ ...product, quantity: 1 }))
  );
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const router = useRouter();

  const [customerList, setCustomerList] = useState([
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

  const totalAmount = products.reduce((total, product) => {
    const discountPrice =
      product.price - (product.price * product.discount) / 100;
    return total + discountPrice * product.quantity;
  }, 0);

  const taxAmount = (totalAmount * 0.18).toFixed(2); // Assuming 18% tax
  const grandTotal = (parseFloat(totalAmount) + parseFloat(taxAmount)).toFixed(
    2
  );

  const increaseQuantity = (productId) => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? { ...product, quantity: product.quantity + 1 }
          : product
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setProducts(
      products.map((product) =>
        product.id === productId && product.quantity > 1
          ? { ...product, quantity: product.quantity - 1 }
          : product
      )
    );
  };

  const handlePaymentSelection = (method) => {
    setPaymentMethod(method);
    if (method === "credit" && !customer) {
      Alert.alert(
        "Customer Required",
        "Please select a customer for credit payment."
      );
    } else if (method === "online") {
      setShowQRCodeModal(true); // Show the QR code modal when online payment is selected
    }
  };

  const finalizeBill = () => {
    if (paymentMethod === "") {
      Alert.alert(
        "Payment method",
        "Please select a payment method before finalizing the bill."
      );
      return;
    }
    if (paymentMethod === "credit" && !customer) {
      Alert.alert(
        "Error",
        "Customer selection is mandatory for credit payment."
      );
      return;
    }
    Alert.alert("Bill Generated", "The bill has been successfully generated.");
    router.push("/home");
  };

  const generateUPIQRCode = () => {
    const upiID = "8303088493@axl"; // Replace with the actual UPI ID
    return `${upiID}?amount=${grandTotal}&name=Payment for Order&currency=INR`;
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className="flex flex-col my-3 px-4 space-y-6">
          <View className="flex-row items-center mb-2">
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 5 }}
            >
              <Ionicons name="chevron-back" size={28} color="teal" />
            </TouchableOpacity>
            <Text className="text-2xl font-semibold text-teal-700">
              Bill Generation
            </Text>
          </View>

          {/* Customer Search */}
          <View>
            <SearchInput
              customers={customerList}
              setFilteredResults={setSearchCustomer}
              placeholder="Search for a customer"
            />
            {customer ? (
              // Show the selected customer details and hide the search results
              <View className="py-3 px-4 mb-3 bg-white rounded-lg shadow-sm flex-row items-center border border-gray-300">
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
                </View>
                <Ionicons name="chevron-forward" size={24} color="gray" />
              </View>
            ) : (
              // Show the search results if no customer is selected
              <>
                {searchCustomer ? (
                  <FlatList
                    data={searchCustomer}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => setCustomer(item)}
                        className="py-3 px-4 mb-3 bg-white rounded-lg shadow-sm flex-row items-center border border-gray-300"
                      >
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-teal-700">
                            {item.name}
                          </Text>
                          <Text className="text-sm text-gray-500">
                            {item.phone}
                          </Text>
                          <Text className="text-sm text-gray-400">
                            {item.address.city}, {item.address.state},{" "}
                            {item.address.country}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={24}
                          color="gray"
                        />
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <Text className="text-gray-600 italic text-sm mt-2">
                    No customer selected, billing for an unnamed customer.
                  </Text>
                )}
              </>
            )}
          </View>

          {/* Selected Products */}
          <View>
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Selected Products
            </Text>
            {products.length === 0 ? (
              <Text className="text-red-500 italic">No products selected.</Text>
            ) : (
              products.map((product) => (
                <View
                  key={product.id}
                  className="flex-row justify-between items-center border-b py-3"
                >
                  <Image
                    source={product.image}
                    style={{ width: 80, height: 80 }}
                    className="rounded-lg mr-4"
                    resizeMode="contain"
                  />
                  <View className="flex-1">
                    <Text className="text-gray-800 font-semibold">
                      {product.name}
                    </Text>
                    <View className="flex-row items-center mt-2 space-x-2">
                      <TouchableOpacity
                        onPress={() => decreaseQuantity(product.id)}
                        className="bg-gray-300 rounded px-2"
                      >
                        <Text className="text-lg font-bold">-</Text>
                      </TouchableOpacity>
                      <Text className="text-gray-800">{product.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => increaseQuantity(product.id)}
                        className="bg-gray-300 rounded px-2"
                      >
                        <Text className="text-lg font-bold">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-800">
                      ₹{product.price} x {product.quantity}
                    </Text>
                    {product.discount > 0 && (
                      <Text className="text-red-500 text-sm">
                        {product.discount}% Off
                      </Text>
                    )}
                    <Text className="text-teal-600 font-bold">
                      ₹
                      {(
                        (product.price -
                          (product.price * product.discount) / 100) *
                        product.quantity
                      ).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Total Amount */}
          <View className="px-4 mt-4 bg-white rounded-lg p-6 shadow-lg">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-medium text-gray-700">
                Subtotal
              </Text>
              <Text className="text-lg font-bold text-gray-800">
                ₹{totalAmount.toFixed(2)}
              </Text>
            </View>
            <View className="h-[1px] bg-gray-300 my-2" />
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-medium text-gray-700">
                Tax (18%)
              </Text>
              <Text className="text-lg font-bold text-gray-800">
                ₹{taxAmount}
              </Text>
            </View>
            <View className="h-[1px] bg-gray-300 my-2" />
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-semibold text-teal-700">
                Grand Total
              </Text>
              <Text className="text-xl font-bold text-teal-800">
                ₹{grandTotal}
              </Text>
            </View>
          </View>

          {/* Payment Method */}
          <View className="px-4 mt-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Payment Method
            </Text>
            <View className="flex-row justify-around mb-4">
              {["online", "cash", "credit"].map((method) => (
                <TouchableOpacity
                  key={method}
                  onPress={() => handlePaymentSelection(method)}
                  className={`py-2 px-4 flex-row items-center rounded ${
                    paymentMethod === method ? "bg-teal-600" : "bg-gray-300"
                  }`}
                >
                  <Ionicons
                    name={
                      method === "online"
                        ? "card"
                        : method === "cash"
                        ? "cash"
                        : "wallet"
                    }
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

          {/* QR Code Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showQRCodeModal}
            onRequestClose={() => setShowQRCodeModal(false)}
          >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-70">
              <View className="bg-white rounded-lg shadow-lg p-6 w-4/5">
                <Text className="text-xl font-bold text-teal-700 mb-4 text-center">
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
                <Text className="text-2xl font-bold text-teal-800 text-center mt-2 mb-4 p-2 border border-teal-600 bg-teal-100 rounded-lg">
                  ₹{grandTotal}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowQRCodeModal(false)}
                  className="bg-teal-600 mt-6 p-3 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Finalize Bill Button */}
          <CustomButton
            title="Finalize Bill"
            handlePress={finalizeBill}
            className="mt-8"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillGenerationScreen;
