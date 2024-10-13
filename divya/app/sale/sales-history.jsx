import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import salesJsonData from "./saleData.json";

const SalesHistoryScreen = () => {
  const [salesData, setSalesData] = useState(salesJsonData);

  const handleEdit = (productId) => {
    Alert.alert("Edit Sale", `Edit sale for Product ID: ${productId}`);
  };

  const handleDelete = (productId) => {
    setSalesData((prevData) =>
      prevData.filter((sale) => sale.product.productId !== productId)
    );
    Alert.alert(
      "Delete Sale",
      `Sale for Product ID: ${productId} has been deleted.`
    );
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className="flex flex-col my-3 px-4 space-y-6">
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
              Sales History
            </Text>
          </View>

          <View className="mt-6">
            <FlatList
              data={salesData}
              keyExtractor={(item) => item.product.productId}
              renderItem={({ item }) => (
                <View className="bg-white border border-gray-100 rounded-lg mb-4 shadow-md flex flex-row justify-between items-center p-4">
                  {/* Product Details */}
                  <View className="flex-1 pr-4">
                    <Text className="text-lg font-semibold text-teal-700 mb-1">
                      {item.product.name}
                    </Text>
                    <Text className="text-gray-600">
                      Quantity: {item.quantity}
                    </Text>
                    <Text className="text-gray-600">Price: ₹{item.price}</Text>
                    <Text className="text-gray-600">
                      Date: {new Date(item.date).toLocaleDateString()}{" "}
                      <Text
                        className={
                          item.isCredit ? "text-red-500" : "text-green-500"
                        }
                      >
                        {item.isCredit ? "(Credit)" : "(Cash)"}
                      </Text>
                    </Text>
                  </View>

                  {/* Edit and Delete Buttons */}
                  <View className="flex flex-col justify-between">
                    <TouchableOpacity
                      onPress={() => handleEdit(item.product.productId)}
                      className="p-2 bg-teal-100 rounded-full mb-2"
                    >
                      <Ionicons
                        name="create-outline"
                        size={24}
                        color="#0d9488"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDelete(item.product.productId)}
                      className="p-2 bg-red-100 rounded-full"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={24}
                        color="#dc2626"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SalesHistoryScreen;
