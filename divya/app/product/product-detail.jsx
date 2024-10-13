import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteProduct,
  fetchSingleProduct,
  toggleProductStatus,
} from "../../redux/slices/productSlice";

const ProductDetails = () => {
  const dispatch = useDispatch();
  const { productId } = useLocalSearchParams();
  const navigation = useNavigation();
  const { product, loading, error } = useSelector((state) => state.product);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProduct = async (productId) => {
    await dispatch(fetchSingleProduct(productId));
  };

  useFocusEffect(
    useCallback(() => {
      fetchProduct(productId);
    }, [productId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProduct(productId);
    setRefreshing(false);
  };

  const handleDelete = async (productId) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            await dispatch(deleteProduct(productId));
            Alert.alert("Success", "Product deleted successfully");
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (productId) => {
    await dispatch(toggleProductStatus(productId));
    Alert.alert(
      "Status Updated",
      `Product is now ${!product.isActive ? "active" : "inactive"}`
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="teal" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>No product details found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white h-full p-4">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Back Button */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                // Optionally navigate to a default screen if there's no back history
                router.push("/home");
              }
            }}
            className="mr-2"
          >
            <Ionicons name="chevron-back" size={28} color="teal" />
          </TouchableOpacity>

          <Text className="text-2xl font-semibold text-teal-700">
            Product Details
          </Text>
        </View>

        {/* Product Image */}
        <View className="mb-6">
          {product.productImage ? (
            <Image
              source={{ uri: product.productImage }}
              style={{
                width: "100%",
                height: 300, // Increased height for better presentation
                borderRadius: 15,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#e0e0e0",
                elevation: 5, // Shadow effect
              }}
            />
          ) : (
            <View className="flex-1 items-center justify-center h-48 mb-4">
              <Text>No Image Available</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-teal-700">
            {product.name}
          </Text>
          <Text className="text-gray-500">{product.category.join(",")}</Text>
        </View>

        {/* Price and Stock */}
        <View className="flex-row justify-between mb-4">
          <Text className="text-xl font-semibold text-teal-700">
            Price: ₹{product.price}
          </Text>
          <Text className="text-xl font-semibold text-teal-700">
            Stock: {product.stockQuantity} {product.unit}
          </Text>
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-teal-700 mb-2">
            Description
          </Text>
          <Text className="text-gray-700 text-base">
            {product.description || "No description available"}
          </Text>
        </View>

        {/* Variants */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-teal-700 mb-2">Variants</Text>
          {product.variants.length > 0 ? (
            product.variants.map((variant, index) => (
              <View key={index} className="flex-row justify-between mb-1">
                <Text className="text-gray-800">{variant.variantName}</Text>
                <Text className="text-gray-800">
                  ₹{variant.variantPrice} - Stock:{" "}
                  {variant.variantStockQuantity}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-600">No variants available</Text>
          )}
        </View>

        {/* Tax and Discount */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-teal-700">
            Discount: <Text className="text-red-500">{product.discount}%</Text>
          </Text>
        </View>

        {/* Active/Inactive Status */}
        <View className="mb-4 flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-teal-700">
            Status:{" "}
            <Text
              className={`${
                product.isActive ? "text-green-500" : "text-red-500"
              }`}
            >
              {product.isActive ? "Active" : "Inactive"}
            </Text>
          </Text>
          <Switch
            value={product.isActive}
            onValueChange={() => handleToggleStatus(productId)}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={product.isActive ? "teal" : "#f4f3f4"}
          />
        </View>

        {/* Edit and Delete Icons */}
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/product/product-edit",
                params: { productId },
              })
            }
            className="flex-row items-center bg-teal-200 p-2 rounded-lg shadow-md"
          >
            <Ionicons name="create-outline" size={24} color="teal" />
            <Text className="text-teal-800 ml-2 font-semibold">
              Edit Product
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(productId)}
            className="flex-row items-center bg-red-200 p-2 rounded-lg shadow-md"
          >
            <MaterialIcons name="delete-forever" size={24} color="red" />
            <Text className="text-red-600 ml-2 font-semibold">
              Delete Product
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetails;
