import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const RateWeightCalculator = ({ setModalVisible }) => {
  const [rate, setRate] = useState(""); // Input for rate per unit
  const [quantity, setQuantity] = useState(""); // Input for quantity
  const [totalPrice, setTotalPrice] = useState(0); // Calculated total price

  // Function to calculate total price
  const calculatePrice = () => {
    const total = parseFloat(rate) * parseFloat(quantity);
    if (!isNaN(total)) {
      setTotalPrice(total);
    } else {
      setTotalPrice(0);
    }
  };

  return (
    <View className="p-6 bg-white rounded-2xl shadow-lg w-full">
      {/* Title */}
      <LinearGradient
        colors={["#D6F6F5", "#B3E0DF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-lg p-4 mb-4"
      >
        <Text className="text-2xl font-bold text-teal-800 text-center">
          Rate/Weight Calculator
        </Text>
      </LinearGradient>

      {/* Input for Rate */}
      <View className="mb-4">
        <Text className="text-lg font-medium text-gray-700">Rate per Unit</Text>
        <TextInput
          value={rate}
          onChangeText={setRate}
          keyboardType="numeric"
          placeholder="Enter rate"
          className="bg-teal-50 p-4 rounded-lg shadow-md mt-2 text-teal-800 text-lg"
        />
      </View>

      {/* Input for Quantity */}
      <View className="mb-4">
        <Text className="text-lg font-medium text-gray-700">Quantity</Text>
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="Enter quantity"
          className="bg-teal-50 p-4 rounded-lg shadow-md mt-2 text-teal-800 text-lg"
        />
      </View>

      {/* Display Calculated Total */}
      <View className="mb-6">
        <Text className="text-lg font-medium text-gray-700">Total Price</Text>
        <Text className="bg-teal-50 p-4 rounded-lg shadow-md mt-2 text-teal-800 text-lg">
          ₹ {totalPrice.toFixed(2)}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex flex-row justify-between mt-8 space-x-4">
        {/* Calculate Button */}
        <TouchableOpacity
          onPress={calculatePrice}
          className="flex-1 h-14 bg-teal-600 rounded-full shadow-lg justify-center"
        >
          <LinearGradient
            colors={["#0d9488", "#14b8a6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 justify-center rounded-full"
          >
            <Text className="text-center text-white font-bold text-lg">
              Calculate
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity
          onPress={() => setModalVisible(false)}
          className="flex-1 h-14 bg-gray-400 rounded-full shadow-lg justify-center"
        >
          <LinearGradient
            colors={["#64748b", "#475569"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 justify-center rounded-full"
          >
            <Text className="text-center text-white font-bold text-lg">
              Close
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RateWeightCalculator;
