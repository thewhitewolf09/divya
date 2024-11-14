import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { fetchAllCustomers } from "../../redux/slices/customerSlice";
import { useDispatch, useSelector } from "react-redux";
import Autocomplete from "react-native-autocomplete-input";
import { addNewSale } from "../../redux/slices/saleSlice";

const BillGenerationScreen = () => {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.customer);

  const { selectedProducts } = useLocalSearchParams();
  const parsedProducts = JSON.parse(selectedProducts || "[]");
  const [customerQuery, setCustomerQuery] = useState("");
  const [customer, setCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [products, setProducts] = useState(
    parsedProducts.map((product) => ({ ...product, quantity: 1 }))
  );
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      await dispatch(fetchAllCustomers());
    };

    fetchCustomers();
  }, []);

  const handleSearch = (query) => {
    if (query) {
      const filtered = customers.filter((item) =>
        item.name.toLowerCase().includes(customerQuery.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
    }
    setCustomerQuery(query); // Update the search input
  };

  const totalAmount = products.reduce((total, product) => {
    const discountPrice =
      product.price - (product.price * product.discount) / 100;
    return total + discountPrice * product.quantity;
  }, 0);

  const taxAmount = (totalAmount * 0).toFixed(2); // Assuming 18% tax
  const grandTotal = (parseFloat(totalAmount) + parseFloat(taxAmount)).toFixed(
    2
  );

  const increaseQuantity = (productId) => {
    setProducts(
      products.map((product) =>
        product._id === productId
          ? { ...product, quantity: product.quantity + 1 }
          : product
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setProducts(
      products.map((product) =>
        product._id === productId && product.quantity > 1
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

    // Confirm before finalizing the bill
    Alert.alert(
      "Confirm Finalization",
      "Are you sure you want to finalize this bill?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            const saleData = products.map((product) => ({
              productId: product._id,
              quantity: product.quantity,
              price: product.price - (product.price * product.discount) / 100,
              customerId: customer ? customer._id : null,
              isCredit: paymentMethod === "credit",
              creditDetails:
                paymentMethod === "credit"
                  ? {
                      amountOwed: grandTotal,
                      paymentStatus: "pending",
                    }
                  : null,
            }));

            try {
              await dispatch(addNewSale(saleData)).unwrap();

              Alert.alert(
                "Bill Generated",
                "The bill has been successfully generated."
              );
              router.push("/home");
            } catch (error) {
              Alert.alert("Error", error || "Failed to generate sale.");
            }
          },
        },
      ],
      { cancelable: false }
    );
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
            <Autocomplete
              data={filteredCustomers}
              value={customerQuery}
              onChangeText={handleSearch}
              placeholder="Search for a customer"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              flatListProps={{
                keyExtractor: (item) => item._id,
                renderItem: ({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setCustomer(item);
                      setCustomerQuery(item.name);
                      setFilteredCustomers([]);
                    }}
                    className="py-3 px-4 mb-3 mx-1 bg-white rounded-lg shadow-sm flex-row items-center border border-gray-300"
                  >
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-teal-700">
                        {item.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {item.mobile}
                      </Text>
                      <Text className="text-sm text-gray-400">
                        {item.address.city}, {item.address.state},{" "}
                        {item.address.country}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="gray" />
                  </TouchableOpacity>
                ),
              }}
              inputContainerStyle={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                height: 64,
                paddingHorizontal: 16,
                marginBottom: 12,
                backgroundColor: "white",
                borderRadius: 14,
                borderWidth: 2,
                borderColor: isFocused ? "#ff9c01" : "#319795",
              }}
              listContainerStyle={{
                position: "absolute",
                top: 60,
                left: 0,
                right: 0,
                zIndex: 1,
                padding: 0,
              }}
            />

            {customer ? (
              <View className="py-3 px-4 mb-3 bg-white rounded-lg shadow-sm flex-row items-center border border-gray-300">
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
                </View>
                <Ionicons name="chevron-forward" size={24} color="gray" />
              </View>
            ) : (
              <Text className="text-gray-600 italic text-sm mt-2">
                No customer selected, billing for an unnamed customer.
              </Text>
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
                  key={product._id}
                  className="flex-row justify-between items-center border-b py-3"
                >
                  <Image
                    source={{ uri: product.productImage }}
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
                        onPress={() => decreaseQuantity(product._id)}
                        className="bg-gray-300 rounded px-2"
                      >
                        <Text className="text-lg font-bold">-</Text>
                      </TouchableOpacity>
                      <Text className="text-gray-800">{product.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => increaseQuantity(product._id)}
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
                Tax (0%)
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
