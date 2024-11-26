import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useDispatch } from "react-redux";
import { fetchAllCustomers } from "../redux/slices/customerSlice";

const SortComponentCustomer = ({
  sortSheetRef,
  snapPoints,
  activeSheet,
  setActiveSheet,
}) => {
  const dispatch = useDispatch();

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
      await dispatch(fetchAllCustomers({ sort: sortOption })).unwrap();
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
      <View className="p-4 bg-white">
        <Text className="text-lg font-bold mb-4 text-teal-700">Sort By</Text>

        <TouchableOpacity
          onPress={() => handleSortSelect("name-asc")}
          className="py-3 border-b border-gray-200"
        >
          <Text className="text-gray-800 text-base">Name: A to Z</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSortSelect("name-desc")}
          className="py-3 border-b border-gray-200"
        >
          <Text className="text-gray-800 text-base">Name: Z to A</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSortSelect("date-desc")}
          className="py-3 border-b border-gray-200"
        >
          <Text className="text-gray-800 text-base">Newest First</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

export default SortComponentCustomer;
