import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Loader, SearchInput, CustomButton } from "../../components"; // Assuming CustomButton is correctly imported
import { router, useFocusEffect } from "expo-router";
import { images } from "../../constants";

const ProductSelectionScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [productList, setProductList] = useState([
    {
      id: 1,
      name: "Organic Avocado",
      price: "250",
      discount: "10", // Example discount
      quantity: 15,
      image: images.demoproduct,
    },
    {
      id: 2,
      name: "Fresh Strawberries",
      price: "300",
      discount: "0", // No discount
      quantity: 10,
      image: images.demoproduct,
    },
    // ... more products
  ]);

  const filteredProducts = productList.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if the product is added
  const isProductAdded = (productId) => {
    return selectedProducts.some((product) => product.id === productId);
  };

  // Add or remove a product based on its current selection state
  const toggleProductSelection = (product) => {
    if (isProductAdded(product.id)) {
      // If the product is already selected, remove it
      setSelectedProducts(
        selectedProducts.filter((selected) => selected.id !== product.id)
      );
    } else {
      // If not selected, add it
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch products logic
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <Loader isLoading={isLoading} />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col align-middle my-3 px-4 space-y-6">
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
              Select Products
            </Text>
          </View>

          {/* Search Input */}
          <SearchInput
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />

          <View className="flex flex-row justify-between items-center my-4 ">
            {/* Products Count */}
            <Text className="text-gray-800 font-semibold text-lg">
              {filteredProducts.length} Products
            </Text>

            {/* Filter & Sort Buttons */}
            <View className="flex flex-row space-x-3">
              {/* Filter Button */}
              <TouchableOpacity
                className="flex flex-row items-center border border-teal-600 rounded-lg py-2 px-3"
                onPress={() => alert("Filter Products")}
              >
                <Ionicons name="filter" size={18} color="#50B498" />
                <Text className="ml-1 text-teal-600 font-semibold">Filter</Text>
              </TouchableOpacity>

              {/* Sort Button */}
              <TouchableOpacity
                className="flex flex-row items-center border border-teal-600 rounded-lg py-2 px-3"
                onPress={() => alert("Sort Products")}
              >
                <Ionicons name="swap-vertical" size={18} color="#50B498" />
                <Text className="ml-1 text-teal-600 font-semibold">Sort</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Product List */}
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={({ item }) => (
              <View className="flex flex-col items-center border border-gray-300 py-3 m-1 w-[48%] rounded-lg shadow-lg relative">
                {item.discount > 0 && (
                  <View className="absolute top-0 left-0 bg-red-500 rounded-br-lg rounded-tl-lg py-1 px-2">
                    <Text className="text-white text-xs font-bold">
                      {item.discount}% OFF
                    </Text>
                  </View>
                )}

                <Image
                  source={item.image}
                  className="w-40 h-40 rounded-lg"
                  resizeMode="contain"
                />
                <Text className="text-gray-700 text-base mb-2">
                  {item.name}
                </Text>
                <Text className="text-gray-800 font-bold">₹{item.price}</Text>
                <TouchableOpacity
                  className={`rounded py-2 px-4 mt-2 ${
                    isProductAdded(item.id) ? "bg-gray-400" : "bg-teal-600"
                  }`}
                  onPress={() => toggleProductSelection(item)}
                >
                  <Text className="text-white font-semibold text-sm">
                    {isProductAdded(item.id) ? "Added (Remove)" : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </ScrollView>
      {/* Custom Next Button */}
      <View className=" mb-4 mx-4">
        <CustomButton
          title="Next"
          handlePress={() =>
            router.push({
              pathname: "/sale/bill-generation",
              params: { selectedProducts: JSON.stringify(selectedProducts) }, // Pass selected products here
            })
          }
          isLoading={isLoading}
          containerStyles="px-6 py-4"
          textStyles="text-lg"
        />
      </View>
    </SafeAreaView>
  );
};

export default ProductSelectionScreen;
