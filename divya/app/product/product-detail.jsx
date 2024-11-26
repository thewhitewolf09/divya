import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  RefreshControl,
  ActivityIndicator,
  Modal,
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
import {
  addItemToCart,
  getCart,
  removeItemFromCart,
} from "../../redux/slices/cartSlice"; 

const ProductDetails = () => {
  const dispatch = useDispatch();
  const { productId } = useLocalSearchParams();
  const navigation = useNavigation();
  const { product, loading, error } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart); // Access the cart from Redux
  const [refreshing, setRefreshing] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false); // Modal state
  const [selectedVariant, setSelectedVariant] = useState(null); // Track selected variant
  const [isOrder, setIsOrder] = useState(false);


  useEffect(() => {
    const fetchCart = async () => {
      await dispatch(getCart(user._id));
    };
    fetchCart();
  }, [dispatch, user._id]);

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

  const handleToggleCartItem = async () => {
    setCartLoading(true);
    const isInCart = (cart.items || [])?.some(
      (item) => item.productId._id === product._id
    );

    if (isInCart) {
      const { payload } = await dispatch(
        removeItemFromCart({
          customerId: user._id,
          productId: product._id,
          variantId: selectedVariant?._id,
        })
      );
      if (payload) {
        Alert.alert(
          "Success",
          `${product.name} has been removed from your cart.`
        );
      } else {
        Alert.alert("Error", "Failed to remove item from cart.");
      }
    } else {
      const { payload } = await dispatch(
        addItemToCart({
          customerId: user._id,
          item: {
            productId: product._id,
            variantId: selectedVariant?._id,
            quantity: 1,
          },
        })
      );
      if (payload) {
        Alert.alert("Success", `${product.name} has been added to your cart.`);
      } else {
        Alert.alert("Error", "Failed to add item to cart.");
      }
    }
    setCartLoading(false);
  };

  const handleAddToCart = () => {
    if (product.variants.length > 0) {
      setShowVariantModal(true); // Show modal if variants exist
    } else {
      // Add directly to cart if no variants exist
      handleToggleCartItem();
    }
  };

  const orderNow = async () => {
    const { payload } = await dispatch(
      addItemToCart({
        customerId: user._id,
        item: {
          productId: product._id,
          variantId: selectedVariant?._id,
          quantity: 1,
        },
      })
    );
    if (payload) {
      setIsOrder(false);
      setOrderLoading(false);
      router.push("/order/view-cart");
    } else {
      setIsOrder(false);
      setOrderLoading(false);
      Alert.alert("Error", "Failed to add item to cart.");
    }
  };

  const handleOrderNow = () => {
    setIsOrder(true);
    setOrderLoading(true);
    if (product?.variants?.length > 0) {
      setShowVariantModal(true);
    } else {
      orderNow();
    }
  };

  const selectVariantAndAddToCart = () => {
    setShowVariantModal(false);
    if (isOrder === true) {
      orderNow();
    } else {
      handleToggleCartItem();
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="small" color="teal" />
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

        {/* Product Image with Add to Cart Button */}
        <View className="mb-6 relative">
          {product?.productImage ? (
            <Image
              source={{ uri: product.productImage }}
              style={{
                width: "100%",
                height: 300,
                borderRadius: 15,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#e0e0e0",
                elevation: 5,
              }}
            />
          ) : (
            <View className="flex-1 items-center justify-center h-48 mb-4">
              <Text>No Image Available</Text>
            </View>
          )}
          {/* Add to Cart Button */}
          {user.role === "customer" ? (
            <TouchableOpacity
              onPress={handleAddToCart}
              disabled={cartLoading}
              className={`absolute top-3 right-3 rounded-full p-2 shadow-md ${
                cart.items?.some((item) => item.productId._id === product._id)
                  ? "bg-red-600" // Change to red when item is in the cart
                  : "bg-teal-600" // Default teal color when item is not in the cart
              }`}
            >
              {cartLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons
                  name={
                    cart.items?.some(
                      (item) => item.productId._id === product._id
                    )
                      ? "remove-circle-outline"
                      : "cart-outline"
                  }
                  size={28}
                  color="white"
                />
              )}
            </TouchableOpacity>
          ) : null}
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

        {/* Conditional Rendering for Customer Role */}
        {user.role === "customer" ? (
          <View className="flex-row justify-evenly mt-4 mb-4">
            {/* Add to Cart Button */}
            <TouchableOpacity
              onPress={handleOrderNow}
              disabled={orderLoading}
              className="flex-row items-center bg-teal-600 p-3 rounded-lg shadow-lg w-[60%] hover:shadow-xl transition duration-200"
            >
              <View className="flex-row items-center justify-center bg-white rounded-full p-2 border-2 border-teal-600 absolute -left-1">
                {orderLoading ? (
                  <ActivityIndicator size="large" color="teal" />
                ) : (
                  <Ionicons name="cart-outline" size={40} color="teal" />
                )}
              </View>
              <Text className="text-white font-semibold ml-8 pl-12">
                Order Now
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
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
          </>
        )}

        {/* Modal for selecting variants */}
        <Modal
          visible={showVariantModal}
          transparent={true}
          animationType="slide"
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white p-6 rounded-lg w-[80%] relative">
              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setShowVariantModal(false)} // Close the modal
                className="absolute top-2 right-2 p-2"
              >
                <Text className="text-gray-500 text-xl">X</Text>
              </TouchableOpacity>

              <Text className="text-xl font-bold text-teal-700 mb-4">
                Select a Variant
              </Text>
              {product.variants.map((variant) => {
                // Check if any other variant of the same product is in the cart
                const isOtherVariantInCart = cart.items?.some(
                  (item) =>
                    item.productId._id === product._id &&
                    item.variantId !== variant._id
                );

                return (
                  <TouchableOpacity
                    key={variant._id}
                    onPress={() => setSelectedVariant(variant)}
                    className={`p-2 mb-2 border ${
                      selectedVariant?._id === variant._id
                        ? "border-teal-600"
                        : "border-gray-300"
                    } rounded-lg ${isOtherVariantInCart ? "opacity-50" : ""}`} // Apply low opacity if other variant of the product is in cart
                    disabled={isOtherVariantInCart} // Disable if other variant of the same product is in cart
                  >
                    <Text className="text-lg">
                      {variant.variantName} - ₹{variant.variantPrice}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                onPress={selectVariantAndAddToCart}
                disabled={!selectedVariant}
                className="mt-4 bg-teal-600 p-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">
                  Select
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetails;
