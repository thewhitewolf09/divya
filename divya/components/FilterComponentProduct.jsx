import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Switch,
  Alert,
} from "react-native";
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../redux/slices/productSlice";
import Ionicons from "react-native-vector-icons/Ionicons";

const FilterComponentProduct = ({
  filterSheetRef,
  snapPoints,
  activeSheet,
  setActiveSheet,
  setFilterApplied,
  filterApplied,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { products, totalProducts, loading, error } = useSelector(
    (state) => state.product
  );
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({
    activeItems: false,
    lowStock: false,
    discounted: false,
  });

  // Backdrop for the bottom sheet
  const renderBackdrop = (props) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.7} 
      pressBehavior="close"
    />
  );


  // Extract dynamic data from products
  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category)
        .flat()
        .map((cat) => cat.trim())
    )
  );

  
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map((product) => product.price).filter(Boolean);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
  
      // Round the prices to the nearest multiple of 100
      const roundedMinPrice = Math.floor(minPrice / 100) * 100;  // Round down to the nearest multiple of 100
      const roundedMaxPrice = Math.ceil(maxPrice / 100) * 100;    // Round up to the nearest multiple of 100
  
      // If only one product exists, ensure the range is sensible
      if (roundedMinPrice === roundedMaxPrice) {
        // Provide a sensible fallback range when there's only one product
        setPriceRange([roundedMinPrice, roundedMinPrice + 100]); // Add ₹100 if there's only one product
      } else {
        setPriceRange([roundedMinPrice, roundedMaxPrice]);
      }
    }
  }, [products]);
  

  const toggleAccordion = (key) => {
    setExpandedFilter((prev) => (prev === key ? null : key));
  };

  const handleToggleCriteria = (key) => {
    setFilterCriteria((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleApplyFilters = async () => {
    setIsLoading(true); // Start loader
    try {
      const filters = {};

      if (searchQuery.trim() !== "") {
        filters.search = searchQuery.trim();
      }
      if (selectedCategories.length > 0) {
        filters.category = selectedCategories.join(",");
      }
      if (filterCriteria.activeItems) {
        filters.active = true;
      }
      if (filterCriteria.lowStock) {
        filters.available = true;
      }
      if (filterCriteria.discounted) {
        filters.discounted = true;
      }


      const [minPrice, maxPrice] = priceRange;
      if (
        minPrice !== Math.min(...products.map((p) => p.price)) ||
        maxPrice !== Math.max(...products.map((p) => p.price))
      ) {
        filters.minPrice = minPrice;
        filters.maxPrice = maxPrice;
      }

      await dispatch(fetchAllProducts({ filters })).unwrap();
      setFilterApplied(true);
      filterSheetRef.current?.close();
    } catch (err) {
      console.error("Error applying filters:", err);
    } finally {
      setIsLoading(false); // Stop loader
    }
  };

  const handleClearFilters = async () => {
    try {
      await dispatch(fetchAllProducts()).unwrap();
      setSearchQuery("");
      setSelectedCategories([]);
      setFilterCriteria({
        activeItems: false,
        lowStock: false,
        discounted: false,
      });
      setFilterApplied(false);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <BottomSheet
      ref={filterSheetRef}
      index={activeSheet === "filter" ? 0 : -1}
      snapPoints={snapPoints}
      onClose={() => setActiveSheet(null)}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
    >
      <BottomSheetScrollView
        contentContainerStyle={{ padding: 16, backgroundColor: "white" }}
      >
        <View className="flex flex-row justify-between items-center">
          <Text className="text-lg font-bold mb-4 text-teal-700">Filters</Text>

          {filterApplied && (
            <TouchableOpacity
              onPress={handleClearFilters}
              className="flex flex-row items-center border-2 border-gray-400 rounded-full px-3 py-1 bg-transparent"
            >
              <Text className="text-gray-700 font-semibold mr-2">Clear</Text>
              <Ionicons name="close-outline" size={20} color="#4B5563" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Accordion */}
        <TouchableOpacity
          onPress={() => toggleAccordion("category")}
          className="py-3 border-b border-gray-200"
        >
          <Text className="text-gray-800 text-base">Category</Text>
        </TouchableOpacity>
        {expandedFilter === "category" && (
          <View className="p-4">
            <TextInput
              placeholder="Search Categories"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="border border-gray-300 rounded px-3 py-2 mb-4"
            />
            <FlatList
              data={categories?.filter((cat) =>
                cat?.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleCategoryToggle(item)}
                  className="py-3 flex-row items-center"
                >
                  <Text
                    className={`text-gray-800 text-base ${
                      selectedCategories.includes(item) ? "font-bold" : ""
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Price Range Accordion */}
        <TouchableOpacity
          onPress={() => toggleAccordion("price")}
          className="py-3 border-b border-gray-200"
        >
          <Text className="text-gray-800 text-base">Price Range</Text>
        </TouchableOpacity>
        {expandedFilter === "price" && (
          <View className="p-4">
            <Text className="text-lg font-semibold mb-4 text-gray-700">
              Price Range
            </Text>
            <MultiSlider
              values={priceRange}
              sliderLength={280}
              min={priceRange[0]} // Min value of the range
              max={priceRange[1]} // Max value of the range
              step={1}
              onValuesChange={(values) => setPriceRange(values)}
              selectedStyle={{
                backgroundColor: "#0f766e",
              }}
              unselectedStyle={{
                backgroundColor: "#d1d5db",
              }}
              markerStyle={{
                backgroundColor: "#0f766e",
              }}
            />

            <Text className="text-center mt-2 text-gray-700">
              ₹{priceRange[0]} - ₹{priceRange[1]}
            </Text>
          </View>
        )}

        {/* Stock & Status Toggles */}
        <View className="py-3 border-b border-gray-200">
          {user.role === "shopOwner" ? (
            <>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-800 text-base">Active Items</Text>
                <Switch
                  value={filterCriteria.activeItems}
                  onValueChange={() => handleToggleCriteria("activeItems")}
                />
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-800 text-base">Low Stock</Text>
                <Switch
                  value={filterCriteria.lowStock}
                  onValueChange={() => handleToggleCriteria("lowStock")}
                />
              </View>
            </>
          ) : null}

          <View className="flex-row justify-between items-center py-2">
            <Text className="text-gray-800 text-base">Discounted Items</Text>
            <Switch
              value={filterCriteria.discounted}
              onValueChange={() => handleToggleCriteria("discounted")}
            />
          </View>

        </View>

        {/* Apply Filters Button */}
        <TouchableOpacity
          onPress={handleApplyFilters}
          disabled={isLoading}
          className={`mt-4 rounded py-2 px-4 ${
            isLoading ? "bg-gray-400" : "bg-teal-600"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            {isLoading ? "Applying..." : "Apply Filters"}
          </Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default FilterComponentProduct;
