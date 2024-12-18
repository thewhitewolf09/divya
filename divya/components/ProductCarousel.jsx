import { router } from "expo-router";
import React from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import Carousel from "react-native-snap-carousel";

const { width: screenWidth } = Dimensions.get("window");

const ProductCarousel = ({ products }) => {
  const recentProducts = products.slice(0, 10);

  const renderCarouselItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/product/product-detail",
          params: { productId: item._id },
        })
      }
      className="bg-white rounded-lg shadow-2xl border-gray-300 border-2 overflow-hidden mb-4"
    >
      {/* Discount Badge */}
      {item.discount > 0 && (
        <View className="absolute top-0 left-0 z-10 bg-red-500 rounded-br-lg rounded-tl-lg py-2 px-2">
          <Text className="text-white text-xs font-bold">
            {item.discount}% OFF
          </Text>
        </View>
      )}

      {/* Product Image */}
      <Image
        source={{ uri: item.productImage }}
        className="w-full h-48 object-cover" // Changed to object-cover for better image coverage
        resizeMode="cover"
      />

      {/* Product Information */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-teal-700">{item.name}</Text>

        {/* Price Section */}
        <View className="mt-2">
          {item.discount > 0 ? (
            <>
              <View className="flex flex-row items-center">
                <Text className="text-gray-800 font-bold mr-2">
                  ₹
                  {(item.price - (item.price * item.discount) / 100).toFixed(2)}
                </Text>
                <Text className="text-gray-500 font-bold line-through">
                  ₹{item.price}
                </Text>
              </View>
            </>
          ) : (
            <Text className="text-gray-800 font-bold">₹{item.price}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <Text className="text-xl font-semibold text-gray-800 mb-4">
        New Arrivals
      </Text>

      <Carousel
        data={recentProducts}
        renderItem={renderCarouselItem}
        sliderWidth={screenWidth}
        itemWidth={screenWidth * 0.8}
        useScrollView={true}
        loop={true}
      />
    </View>
  );
};

export default ProductCarousel;
