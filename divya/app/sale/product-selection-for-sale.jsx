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
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Loader, SearchInput, CustomButton } from "../../components"; // Assuming CustomButton is correctly imported
import { router, useFocusEffect } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../../redux/slices/productSlice";
import BottomSheet from "@gorhom/bottom-sheet";
import SortComponentProduct from "../../components/SortComponentProduct";
import FilterComponentProduct from "../../components/FilterComponentProduct";

const ProductSelectionScreen = () => {
  const dispatch = useDispatch();
  const { products, totalProducts, currentPage, totalPages, loading, error } = useSelector((state) => state.product);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredResults, setFilteredResults] = useState(products);
  const [filterApplied, setFilterApplied] = useState(false);

  // Fetch Products
  const fetchProducts = async () => {
  
    try {
      await dispatch(fetchAllProducts()).unwrap();
  
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts(true);
    }, [])
  );

  // Refresh Products
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(true);
  };


  

  // References to control the bottom sheet
  const [activeSheet, setActiveSheet] = useState(null);
  const filterSheetRef = useRef(null);
  const sortSheetRef = useRef(null);
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
          setFilteredResults={setFilteredResults}
          products={products}
          placeholder="Search a Product"
        />

        <View className="flex flex-row justify-between items-center my-4 ">
          {/* Products Count */}
          <Text className="text-gray-800 font-semibold text-lg">
            {filteredResults.length} Products
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
          data={filteredResults}
          keyExtractor={(item) => item._id}
          numColumns={2}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
              <Text className="text-gray-700 text-base mb-2">{item.name}</Text>
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
          contentContainerStyle={{ paddingBottom: 260 }}

        />
      </View>
      {/* Custom Next Button */}
      <View
        className=" mx-4"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: "white",
        }}
      >
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
       <FilterComponentProduct
        filterSheetRef={filterSheetRef}
        snapPoints={snapPoints}
        activeSheet={activeSheet}
        setActiveSheet={setActiveSheet}
        setFilterApplied={setFilterApplied}
        filterApplied={filterApplied}
      />

      {/* Sort Bottom Sheet */}
      <SortComponentProduct
        sortSheetRef={sortSheetRef}
        snapPoints={snapPoints}
        activeSheet={activeSheet}
        setActiveSheet={setActiveSheet}
      />
    </SafeAreaView>
  );
};

export default ProductSelectionScreen;
