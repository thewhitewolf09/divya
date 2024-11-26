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
import { SearchInput, Loader } from "../../components";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";
import { fetchAllProducts } from "../../redux/slices/productSlice";
import { useSelector, useDispatch } from "react-redux";
import FilterComponentProduct from "../../components/FilterComponentProduct";
import SortComponentProduct from "../../components/SortComponentProduct";

const Product = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);
  const [filterApplied, setFilterApplied] = useState(false);

  // References to control the bottom sheet
  const [activeSheet, setActiveSheet] = useState(null);
  const filterSheetRef = useRef(null);
  const sortSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);

  const handleOpenFilter = () => {
    setActiveSheet("filter");
    filterSheetRef.current?.expand();
    sortSheetRef.current?.close();
  };

  const handleOpenSort = () => {
    setActiveSheet("sort");
    sortSheetRef.current?.expand();
    filterSheetRef.current?.close();
  };

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
      fetchProducts();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-white h-full pb-16">
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
          numColumns={2} // Display two products in a row
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

              {/* Product Image */}
              <Image
                source={{ uri: item.productImage }}
                className="w-40 h-40 rounded-lg" // Larger image
                resizeMode="contain"
              />

              {/* Product Name */}
              <Text className="text-gray-700 text-base mb-2">{item.name}</Text>

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
                          ₹{(item.price / (1 - item.discount / 100)).toFixed(2)}
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
          contentContainerStyle={{ paddingBottom: 200 }}
        />

        {/* Action buttons */}
        {user?.role === "shopOwner" && (
          <View className="absolute bottom-32 left-4 right-4 bg-white p-2  flex flex-row justify-evenly">
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
        )}
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
