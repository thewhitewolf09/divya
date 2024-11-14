import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useDispatch, useSelector } from "react-redux"; // Import hooks from react-redux
import { deleteSale, getAllSales } from "../../redux/slices/saleSlice";

const SalesHistoryScreen = () => {
  const dispatch = useDispatch(); 
  const [refreshing, setRefreshing] = useState(false);
  const { sales, loading, error } = useSelector((state) => state.sale);

  const fetchSales = async () => {
    await dispatch(getAllSales());
  };

  useFocusEffect(
    useCallback(() => {
      fetchSales();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    fetchSales();
    setRefreshing(false);
  };



  const handleDelete = (saleId) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete the sale for Product ID: ${saleId}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await dispatch(deleteSale(saleId)).unwrap();

              Alert.alert(
                "Success",
                `Sale for Product ID: ${saleId} has been deleted.`
              );
            } catch (error) {
              // Check if error is a string or has a message property
              const errorMessage =
                typeof error === "string"
                  ? error
                  : error?.resultMessage || "Failed to delete sale.";

              Alert.alert("Error", errorMessage);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };



  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
              data={sales.slice().sort((a, b) => new Date(b.date) - new Date(a.date))}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View className="bg-white border border-gray-100 rounded-lg mb-4 shadow-md flex flex-row justify-between items-center p-4">
                  {/* Product Details */}
                  <View className="flex-1 pr-4">
                    <Text className="text-lg font-semibold text-teal-700 mb-1">
                      {item.productId.name}
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

                  <TouchableOpacity
                    onPress={() => handleDelete(item._id)}
                    className="p-2 bg-red-100 rounded-full"
                  >
                    <Ionicons name="trash-outline" size={24} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 16 }}
              ListEmptyComponent={() => (
                <View className="flex items-center justify-center h-64">
                  <Text className="text-gray-500 text-lg">No Sale History</Text>
                </View>
              )}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SalesHistoryScreen;
