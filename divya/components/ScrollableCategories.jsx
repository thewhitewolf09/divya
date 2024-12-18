import { router } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

const ScrollableCategories = ({ products }) => {

  const categories = [
    ...new Set(products.flatMap((product) => product.category)),
  ];

  // Handle category selection
  const onCategoryPress = async (category) => {
    try {
      const filters = {};
      filters.category = category;
      router.push({
        pathname: "/products",
        params: { filters: JSON.stringify(filters) },
      });
    } catch (err) {
      console.error("Error applying filters:", err);
    }
  };

  return (
    <View className="mt-6 mb-6">
      <View className=" flex flex-row justify-between">
        <Text className="text-xl font-semibold text-gray-800 mb-6">
          Categories
        </Text>
        <TouchableOpacity onPress={() => router.replace("/products")}>
          <Text className="text-teal-700 text-base font-medium underline ">
            View All
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row space-x-4"
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onCategoryPress(category)}
            className="bg-teal-50 border-2 border-teal-700 rounded-full w-20 h-20 flex items-center justify-center shadow-lg hover:shadow-2xl transform transition-all duration-200 ease-in-out hover:scale-105 hover:bg-teal-100"
          >
            <Text className="text-teal-700 text-sm font-semibold tracking-wide">
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ScrollableCategories;
