import { View, Text, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useDispatch } from "react-redux";
import { fetchAllProducts } from "../redux/slices/productSlice";

const SortComponentProduct = ({
  sortSheetRef,
  snapPoints,
  activeSheet,
  setActiveSheet,
}) => {
  const dispatch = useDispatch();

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

  const handleSortSelect = async (sortOption) => {
    try {
      await dispatch(fetchAllProducts({ sort: sortOption })).unwrap();
      sortSheetRef.current?.close();
    } catch (err) {
      console.error("Error applying sort:", err);
    }
  };

  return (
    <BottomSheet
      ref={sortSheetRef}
      index={activeSheet === "sort" ? 0 : -1}
      snapPoints={snapPoints}
      onClose={() => setActiveSheet(null)}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
    >
      <View className="p-4 bg-white rounded-t-lg shadow-lg">
        <Text className="text-lg font-bold mb-4 text-teal-700">Sort By</Text>
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
  );
};

export default SortComponentProduct;
