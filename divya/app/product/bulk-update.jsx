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
  ActivityIndicator,
} from "react-native";
import { SearchInput, Loader, FormField, CustomButton } from "../../components"; // Import the components
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import { useDispatch, useSelector } from "react-redux";
import {
  bulkUpdateProducts,
  fetchAllProducts,
} from "../../redux/slices/productSlice";
import FilterComponentProduct from "../../components/FilterComponentProduct";
import SortComponentProduct from "../../components/SortComponentProduct";

const BulkUpdateScreen = () => {
  const dispatch = useDispatch();
  const { products, totalProducts, currentPage, totalPages, loading, error } =
    useSelector((state) => state.product);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]); // Keep track of selected products
  const [bulkDiscount, setBulkDiscount] = useState(""); // Bulk discount input
  const [filteredResults, setFilteredResults] = useState([]);
  const [filterApplied, setFilterApplied] = useState(false);

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

  // Fetch Products with Pagination
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(true);
    setRefreshing(false);
  };

 

  const handleBulkUpdate = async () => {
    try {
      // Logic to prepare updated products
      const updatedProducts = filteredResults.map((product) => {
        if (selectedProducts.includes(product._id)) {
          return {
            ...product,
            discount: bulkDiscount !== "" ? bulkDiscount : product.discount,
          };
        }
        return product;
      });

      setFilteredResults(updatedProducts);

      const resultAction = await dispatch(bulkUpdateProducts(updatedProducts));

      if (bulkUpdateProducts.fulfilled.match(resultAction)) {
        Alert.alert("Success", "Products updated successfully!");
        await dispatch(fetchAllProducts());
      } else {
        const { failures } = resultAction.payload;
        if (failures && failures.length > 0) {
          const errorMessages = failures
            .map(
              (failure) =>
                `Failed to update product ID ${failure._id}: ${failure.message}`
            )
            .join("\n");
          Alert.alert("Error", errorMessages);
        } else {
          Alert.alert(
            "Error",
            "Unknown error occurred while updating products."
          );
        }
      }
    } catch (error) {
      // Catch any unexpected errors
      console.error("Error during bulk update:", error);
      Alert.alert("Error", "An error occurred while updating products.");
    } finally {
      // Reset the fields regardless of success or failure
      setBulkDiscount("");
      setSelectedProducts([]);
    }
  };

  // Function to toggle product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((_id) => _id !== productId)
        : [...prev, productId]
    );
  };


  return (
    <SafeAreaView className="bg-white h-full">
      <View className="flex flex-col align-middle my-3 px-4 space-y-6">
        {/* Header */}
        <View className="flex justify-between items-start flex-row mb-6">
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
              Product Bulk Update
            </Text>
          </View>
          <TouchableOpacity onPress={() => alert("Notification Screen")}>
            <View className="mt-1.5">
              <Ionicons name="notifications" size={24} color="#0f766e" />
            </View>
          </TouchableOpacity>
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

        {/* Fields for Bulk Update */}
        <View className="mb-4 border border-gray-300 p-2 rounded">
          {/* Bulk Discount Input */}
          <FormField
            title="Bulk Discount (%)"
            value={bulkDiscount}
            placeholder="Enter bulk discount"
            handleChangeText={setBulkDiscount}
            keyboardType="numeric"
            otherStyles="mb-4"
          />
        </View>

        {/* Product List with Selection */}
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.name} // Use product name as key
          numColumns={2}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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

              <TouchableOpacity
                onPress={() => toggleProductSelection(item._id)}
                className="flex flex-col items-center"
              >
                {/* Checkbox */}
                <View className="absolute top-1 right-1 z-10">
                  <View
                    className={`w-6 h-6 border-2 border-teal-600 rounded ${
                      selectedProducts.includes(item._id)
                        ? "bg-teal-600"
                        : "bg-white"
                    }`}
                  >
                    {selectedProducts.includes(item._id) && (
                      <Ionicons name="checkmark" size={20} color="white" />
                    )}
                  </View>
                </View>

                <Image
                  source={{ uri: item.productImage }}
                  className="w-40 h-40 rounded-lg"
                  resizeMode="contain"
                />
                <Text className="text-gray-700 text-base mb-2">
                  {item.name}
                </Text>
                <Text className="text-gray-800 font-bold">₹{item.price}</Text>
                <Text className="text-gray-600">Q: {item.stockQuantity}</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 520 }}
        />
      </View>
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
          title="Bulk Update"
          handlePress={handleBulkUpdate}
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

export default BulkUpdateScreen;
