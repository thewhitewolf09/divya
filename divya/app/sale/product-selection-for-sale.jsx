import React, { useCallback, useMemo, useRef, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../../redux/slices/productSlice";
import BottomSheet from "@gorhom/bottom-sheet";


const ProductSelectionScreen = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);

  console.log(products)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async () => {
    await dispatch(fetchAllProducts());
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const [activeSheet, setActiveSheet] = useState(null);

  // References to control the bottom sheet
  const filterSheetRef = useRef(null);
  const sortSheetRef = useRef(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);

  // Function to toggle the filter bottom sheet
  const handleOpenFilter = () => {
    setActiveSheet("filter");
    filterSheetRef.current?.expand();
    sortSheetRef.current?.close(); // Close sort sheet if open
  };

  // Function to toggle the sort bottom sheet
  const handleOpenSort = () => {
    setActiveSheet("sort");
    sortSheetRef.current?.expand();
    filterSheetRef.current?.close(); // Close filter sheet if open
  };

  const handleCloseSheet = () => {
    setActiveSheet(null);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if the product is added
  const isProductAdded = (productId) => {
    return selectedProducts.some((product) => product._id === productId);
  };

  // Add or remove a product based on its current selection state
  const toggleProductSelection = (product) => {
    if (isProductAdded(product._id)) {
      // If the product is already selected, remove it
      setSelectedProducts(
        selectedProducts.filter((selected) => selected._id !== product._id)
      );
    } else {
      // If not selected, add it
      setSelectedProducts([...selectedProducts, product]);
    }
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
                onPress={handleOpenFilter}
              >
                <Ionicons name="filter" size={18} color="#50B498" />
                <Text className="ml-1 text-teal-600 font-semibold">Filter</Text>
              </TouchableOpacity>

              {/* Sort Button */}
              <TouchableOpacity
                className="flex flex-row items-center border border-teal-600 rounded-lg py-2 px-3"
                onPress={handleOpenSort}
              >
                <Ionicons name="swap-vertical" size={18} color="#50B498" />
                <Text className="ml-1 text-teal-600 font-semibold">Sort</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Product List */}
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item._id}
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
                  source={{ uri: item.productImage }}
                  className="w-40 h-40 rounded-lg"
                  resizeMode="contain"
                />
                <Text className="text-gray-700 text-base mb-2">
                  {item.name}
                </Text>
                <Text className="text-gray-800 font-bold">₹{item.price}</Text>
                <TouchableOpacity
                  className={`rounded py-2 px-4 mt-2 ${
                    isProductAdded(item._id) ? "bg-gray-400" : "bg-teal-600"
                  }`}
                  onPress={() => toggleProductSelection(item)}
                >
                  <Text className="text-white font-semibold text-sm">
                    {isProductAdded(item._id) ? "Added (Remove)" : "Add"}
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

      {/* Filter Bottom Sheet */}
      <BottomSheet
        ref={filterSheetRef}
        index={activeSheet === "filter" ? 0 : -1}
        snapPoints={snapPoints}
        onClose={handleCloseSheet}
        enablePanDownToClose
      >
        <View className="p-4 bg-white rounded-t-lg shadow-lg">
          <Text className="text-lg font-bold mb-4 text-teal-700">
            Filter By
          </Text>

          {/* Filter Options */}
          <TouchableOpacity
            onPress={() => handleFilterSelect("category")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Category</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFilterSelect("price")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Price Range</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFilterSelect("stock")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Stock Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFilterSelect("discount")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Discounted Items</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFilterSelect("active")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Active Items</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFilterSelect("low-stock")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Low Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFilterSelect("recently-added")}
            className="py-3"
          >
            <Text className="text-gray-800 text-base">Recently Added</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Sort Bottom Sheet */}
      <BottomSheet
        ref={sortSheetRef}
        index={activeSheet === "sort" ? 0 : -1}
        snapPoints={snapPoints}
        onClose={handleCloseSheet}
        enablePanDownToClose
        style={{ zIndex: 1001 }}
      >
        <View className="p-4 bg-white rounded-t-lg shadow-lg">
          <Text className="text-lg font-bold mb-4 text-teal-700">Sort By</Text>

          {/* Sort Options */}
          <TouchableOpacity
            onPress={() => handleSortSelect("relevance")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Relevance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSortSelect("price-asc")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Price: Low to High</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSortSelect("price-desc")}
            className="py-3 border-b border-gray-200"
          >
            <Text className="text-gray-800 text-base">Price: High to Low</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSortSelect("newest-first")}
            className="py-3"
          >
            <Text className="text-gray-800 text-base">Newest First</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default ProductSelectionScreen;
