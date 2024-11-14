import { useState, useCallback, useRef, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  View,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SearchInput, Loader } from "../../components";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";
import { fetchAllProducts } from "../../redux/slices/productSlice";
import { useSelector, useDispatch } from "react-redux";
import BottomSheet from "@gorhom/bottom-sheet";

const Product = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Handle closing the bottom sheet and resetting the active sheet state
  const handleCloseSheet = () => {
    setActiveSheet(null);
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
          {/* Header */}
          <View className="flex justify-between items-start flex-row mb-6">
            <View>
              <Text className="text-2xl font-semibold text-teal-700">
                Products
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.replace("/notifications")}>
              <View className="mt-1.5">
                <Ionicons name="notifications" size={24} color="#0f766e" />
              </View>
            </TouchableOpacity>
          </View>

          <SearchInput />

          <View className="flex flex-row justify-between items-center my-4 ">
            {/* Products Count */}
            <Text className="text-gray-800 font-semibold text-lg">
              {products.length} Products
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
            data={products}
            keyExtractor={(item) => item._id}
            numColumns={2} // Display two products in a row
            renderItem={({ item }) => (
              <View className="flex flex-col items-center border border-gray-300 py-3 m-1 w-[48%] rounded-lg shadow-lg relative">
                {/* Discount Sticker */}
                {item.discount > 0 && (
                  <View className="absolute top-0 left-0 bg-red-500 rounded-br-lg rounded-tl-lg py-1 px-2">
                    <Text className="text-white text-xs font-bold">
                      {item.discount}% OFF
                    </Text>
                  </View>
                )}

                {/* Product Image */}
                <Image
                  source={{ uri: item.productImage }}
                  className="w-40 h-40 rounded-lg" // Larger image
                  resizeMode="contain"
                />

                {/* Product Name */}
                <Text className="text-gray-700 text-base mb-2">
                  {item.name}
                </Text>

                {/* Product Details */}
                <View className="flex flex-row justify-between w-[80%] items-center">
                  {/* Price and Discounted Price */}
                  <View className="flex flex-col">
                    {item.discount > 0 ? (
                      <>
                        <View className="flex flex-row">
                          {/* Show discounted price */}
                          <Text className="text-gray-800 font-bold mr-1">
                            ₹{item.price}
                          </Text>
                          {/* Show original price crossed out */}
                          <Text className="text-gray-500 text-sm line-through">
                            ₹
                            {(item.price / (1 - item.discount / 100)).toFixed(
                              2
                            )}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <Text className="text-gray-800 font-bold">
                        ₹{item.price}
                      </Text>
                    )}
                  </View>

                  {/* Quantity */}
                  <Text className="text-gray-600">Q: {item.stockQuantity}</Text>
                </View>

                {/* View Details Button */}
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/product/product-detail",
                      params: { productId: item._id },
                    })
                  }
                  className="bg-teal-600 rounded py-2 px-4 mt-2"
                >
                  <Text className="text-white font-semibold text-sm">
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => (
              <View className="flex items-center justify-center mt-10">
                <Text className="text-gray-600 text-lg">
                  No products available.
                </Text>
              </View>
            )}
          />
          
          {/* Quick Actions */}
          {user?.role === "shopOwner" ? (
            <View className="flex flex-row flex-wrap justify-evenly mb-2 ">
              <ActionButton
                title="🛒 Add Product"
                colors={["#DEF9C4", "#9CDBA6"]}
                onPress={() => router.replace("/product/add-product")}
              />
              <ActionButton
                title="📦 Bulk Update"
                colors={["#50B498", "#468585"]}
                onPress={() => router.replace("/product/bulk-update")}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>

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

const ActionButton = ({ title, colors, onPress }) => (
  <LinearGradient
    colors={colors}
    className="rounded-lg p-4 my-1 mx-1 w-5/12"
    style={{ elevation: 2 }}
  >
    <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
      <Text className="text-white text-center font-bold">{title}</Text>
    </TouchableOpacity>
  </LinearGradient>
);

export default Product;
