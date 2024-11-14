import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCart,
  getCart,
  removeItemFromCart,
  updateItemQuantity,
} from "../../redux/slices/cartSlice";
import { useFocusEffect, useRouter } from "expo-router";

const CartScreen = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { cart, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);

  // States to track which button (plus or minus) is loading for each item
  const [loadingItemIdPlus, setLoadingItemIdPlus] = useState(null);
  const [loadingItemIdMinus, setLoadingItemIdMinus] = useState(null);

  const increaseQuantity = async (productId) => {
    const item = cart.items.find((item) => item?._id === productId);
    if (item) {
      const newQuantity = item.quantity + 1;
      setLoadingItemIdPlus(productId); // Set loading for the plus button
      await dispatch(
        updateItemQuantity({
          customerId: user?._id,
          productId,
          quantity: newQuantity,
        })
      );
      setLoadingItemIdPlus(null); // Clear loading after update
    }
  };

  const decreaseQuantity = async (productId) => {
    const item = cart.items.find((item) => item?._id === productId);
    if (item && item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      setLoadingItemIdMinus(productId); // Set loading for the minus button
      await dispatch(
        updateItemQuantity({
          customerId: user?._id,
          productId,
          quantity: newQuantity,
        })
      );
      setLoadingItemIdMinus(null); // Clear loading after update
    } else if (item.quantity === 1) {
      Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => {
            // Logic to remove the item
          },
        },
      ]);
    }
  };

  const removeItem = (productId, variantId) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        onPress: async () => {
          try {
            const customerId = user?._id;

            await dispatch(
              removeItemFromCart({ customerId, productId, variantId })
            );
          } catch (error) {
            Alert.alert("Error", error);
          }
        },
      },
    ]);
  };

  const clearCartHandler = async () => {
    Alert.alert("Clear Cart", "Are you sure you want to remove all items?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        onPress: async () => {
          try {
            const customerId = user?._id; // Assuming you have access to the `user` object
            await dispatch(clearCart(customerId));
          } catch (error) {
            Alert.alert("Error", "Failed to clear the cart");
          }
        },
      },
    ]);
  };

  const proceedToCheckout = () => {
    // Prepare necessary data for checkout
    const checkoutData = {
      items: cart.items,
      totalAmount: cart.totalAmount,
    };

    router.push({
      pathname: "/order/checkout",
      params: { data: JSON.stringify(checkoutData) }, // Pass the cart data and total amount
    });
  };

  const fetchCartData = async (customerId) => {
    await dispatch(getCart(customerId));
  };

  useFocusEffect(
    useCallback(() => {
      fetchCartData(user?._id);
    }, [user?._id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCartData(user?._id);
    setRefreshing(false);
  };

  const renderCartItem = ({ item }) => {
    // Calculate the original price before discount
    const originalPrice = item.price / (1 - item.productId.discount / 100);

    return (
      <View
        key={item?._id}
        className="bg-white shadow-lg rounded-xl flex-row justify-between items-center m-1 p-4 shadow-black shadow-offset-x-0 shadow-offset-y-2 shadow-opacity-10"
      >
        {/* Product Image */}
        <Image
          source={{ uri: item.productId.productImage }}
          className="w-20 h-20 rounded-lg border border-gray-300"
          resizeMode="cover"
        />

        {/* Product Details */}
        <View className="flex-1 ml-3">
          <Text className="text-lg font-bold text-[#2c3e50] mb-1">
            {item.productId.name}
          </Text>
          <Text className="text-sm text-[#7f8c8d]">
            {item.productId?.category?.join(", ")}
          </Text>

          {item.variantId && item.productId?.variants ? (
            <Text className="text-sm text-[#7f8c8d]">
              {
                item.productId.variants.find(
                  (variant) => variant._id === item.variantId
                )?.variantName
              }
            </Text>
          ) : null}

          <View className="flex-row items-center mt-2.5">
            {/* Decrease Quantity Button */}
            {loadingItemIdMinus === item?._id ? (
              <ActivityIndicator size="small" color="#7f8c8d" />
            ) : (
              <TouchableOpacity
                onPress={() => decreaseQuantity(item?._id)}
                className="bg-[#f5f5f5] rounded-lg px-2.5 py-1.5 shadow-md"
                disabled={
                  loadingItemIdPlus === item?._id ||
                  loadingItemIdMinus === item?._id
                }
              >
                <Text className="text-lg font-semibold text-[#7f8c8d]">−</Text>
              </TouchableOpacity>
            )}

            <Text className="mx-4 text-lg font-medium text-[#2c3e50]">
              {item.quantity}
            </Text>

            {/* Increase Quantity Button */}
            {loadingItemIdPlus === item?._id ? (
              <ActivityIndicator size="small" color="#7f8c8d" />
            ) : (
              <TouchableOpacity
                onPress={() => increaseQuantity(item?._id)}
                className="bg-[#f5f5f5] rounded-lg px-2.5 py-1.5 shadow-md"
                disabled={
                  loadingItemIdPlus === item?._id ||
                  loadingItemIdMinus === item?._id
                }
              >
                <Text className="text-lg font-semibold text-[#7f8c8d]">+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Product Price */}
        <View style={{ alignItems: "flex-end", marginRight: 8 }}>
          {/* Show original price with strikethrough if discount is available */}
          {item.productId.discount > 0 && (
            <Text className="text-gray-500 text-sm line-through">
              ₹{(originalPrice * item.quantity).toFixed(2)}
            </Text>
          )}
          {/* Show final price after discount */}
          <Text style={{ color: "#2c3e50", fontWeight: "bold", fontSize: 16 }}>
            ₹{(item.price * item.quantity).toFixed(2)}
          </Text>
          {/* Display discount percentage */}
          {item.productId.discount > 0 && (
            <Text className="text-green-600 text-xs">
              {item.productId.discount}% off
            </Text>
          )}
        </View>

        {/* Remove Item Button */}
        <TouchableOpacity
          onPress={() => removeItem(item?.productId._id, item?.variantId)}
          style={{
            padding: 8,
            borderRadius: 8,
            marginLeft: 8,
          }}
        >
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col px-4 mt-4 space-y-4">
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
              My Cart
            </Text>
          </View>
          <FlatList
            data={cart.items}
            keyExtractor={(item) => item?._id}
            renderItem={renderCartItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={() => (
              <Text className="text-center text-lg text-gray-600">
                Your cart is empty.
              </Text>
            )}
          />

          {cart.items?.length > 0 ? (
            <TouchableOpacity
              onPress={clearCartHandler} // Attach clear cart handler
              className="flex flex-row items-center justify-end"
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-red-600 font-semibold text-lg underline">
                Clear Cart
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      {/* Checkout Section */}
      {cart.items?.length > 0 && (
        <View className="bg-white border-t border-gray-300 shadow-lg py-4 px-6 absolute bottom-0 w-full flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-gray-800">
            Total: ₹{cart.totalAmount?.toFixed(2)}
          </Text>
          <TouchableOpacity
            onPress={proceedToCheckout}
            className="flex flex-row items-center justify-center bg-teal-600 rounded-lg py-3 px-6 shadow-lg shadow-teal-800 active:scale-95 transition-all duration-150"
          >
            <Ionicons
              name="cart-outline"
              size={24}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text className="text-white font-bold text-lg tracking-wide">
              Check Out
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;
