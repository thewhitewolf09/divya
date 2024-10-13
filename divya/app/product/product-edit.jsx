import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { CustomButton, FormField } from "../../components";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { Dropdown } from "react-native-element-dropdown";
import { Chip } from "react-native-paper";
import { images } from "../../constants";
import { useDispatch, useSelector } from "react-redux";
import {
  addProductVariant,
  deleteProductVariant,
  fetchSingleProduct,
  updateProduct,
  uploadProductImage,
} from "../../redux/slices/productSlice";

const ProductEditScreen = () => {
  const { productId } = useLocalSearchParams();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { product, loading, error } = useSelector((state) => state.product);

  const [editProduct, setEditProduct] = useState(product);

  const [newCategory, setNewCategory] = useState(""); // For creating new category
  const [newVariant, setNewVariant] = useState({
    variantName: "",
    variantPrice: "",
    variantStockQuantity: "",
  });

  const units = [
    { label: "kg", value: "kg" },
    { label: "liter", value: "liter" },
    { label: "piece", value: "piece" },
    { label: "pack", value: "pack" },
    { label: "dozen", value: "dozen" },
  ];

  const availableCategories = ["Milk", "Sweet", "Namkeen", "Shake", "Juice"];
  const variantOptions = ["Small", "Medium", "Large"];

  const fetchProduct = async (productId) => {
    await dispatch(fetchSingleProduct(productId));
  };

  useEffect(() => {
    fetchProduct(productId);
  }, [productId]);

  useEffect(() => {
    if (product) {
      setEditProduct(product);
    }
  }, [product]);

  const handleUpdateProduct = async () => {
    try {
      await dispatch(
        updateProduct({ id: productId, productData: editProduct })
      ).unwrap();
      Alert.alert("Success", "Product updated successfully");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update product");
    }
  };

  const handleAddVariant = async () => {
    if (
      !newVariant.variantName ||
      !newVariant.variantPrice ||
      !newVariant.variantStockQuantity
    ) {
      Alert.alert("Error", "Please fill in all variant fields");
      return;
    }

    const updatedVariants = [
      ...editProduct.variants,
      {
        variantName: newVariant.variantName,
        variantPrice: parseFloat(newVariant.variantPrice),
        variantStockQuantity: parseInt(newVariant.variantStockQuantity),
      },
    ];

    setEditProduct((prevProduct) => ({
      ...prevProduct,
      variants: updatedVariants,
    }));

    const variantData = {
      productId: productId,
      variant: {
        variantName: newVariant.variantName,
        variantPrice: parseFloat(newVariant.variantPrice),
        variantStockQuantity: parseInt(newVariant.variantStockQuantity),
      },
    };

    try {
      await dispatch(addProductVariant(variantData)).unwrap();
      Alert.alert("Success", "Variant added successfully");
      setNewVariant({
        variantName: "",
        variantPrice: "",
        variantStockQuantity: "",
      });
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to add variant");
    }
  };

  const handleDeleteVariant = (index) => {
    // Show confirmation dialog before deleting
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this variant?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Check if the variant exists
            const currentEditProduct = editProduct;
            if (
              currentEditProduct &&
              currentEditProduct.variants &&
              currentEditProduct.variants[index]
            ) {
              const variantId = currentEditProduct.variants[index]?._id;
              const variantData = {
                productId: currentEditProduct?._id,
                variantId,
              };

              try {
                await dispatch(deleteProductVariant(variantData));

                // Update the local state after successful deletion
                setEditProduct((prevProduct) => ({
                  ...prevProduct,
                  variants: prevProduct.variants.filter((_, i) => i !== index),
                }));

                Alert.alert("Success", "Variant deleted successfully");
              } catch (error) {
                Alert.alert(
                  "Error",
                  error.message || "Failed to delete variant"
                );
              }
            } else {
              Alert.alert("Error", "Variant not found");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteCategory = (index) => {
    setEditProduct((prevProduct) => ({
      ...prevProduct,
      category: prevProduct.category.filter((_, i) => i !== index),
    }));
  };

  const handleAddCategory = () => {
    if (!newCategory) {
      Alert.alert("Error", "Please enter a category");
      return;
    }

    setEditProduct((prevProduct) => ({
      ...prevProduct,
      category: [...prevProduct.category, newCategory],
    }));
    setNewCategory("");
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].fileSize <= 5 * 1024 * 1024) {
      // Compress and resize the image
      const compressedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }], // Resize the image (e.g., width of 800px)
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress the image
      );

      try {
        const imageData = new FormData();

        imageData.append("file", {
          uri: compressedImage.uri,
          type: "image/jpeg", // Adjust type as needed
          name: "product-image.jpg",
        });

        // Dispatch image upload action
        const imageUploadResult = await dispatch(
          uploadProductImage({
            id: productId,
            imageData,
          })
        );
        // Handle image upload success/failure
        if (uploadProductImage.fulfilled.match(imageUploadResult)) {
          Alert.alert("Success", "Image uploaded successfully!");
        } else {
          Alert.alert("Error", "Image upload failed.");
        }
      } catch (error) {
        Alert.alert("Error", error.message || "Failed to upload image");
      }
    } else {
      Alert.alert("Error", "Image size must be less than 5MB.");
    }
  };

  return (
    <SafeAreaView className="bg-white h-full p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
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
            Edit Product
          </Text>
        </View>

        {/* Stylish Image Upload with Change Image Text */}
        <View className="mb-4">
          <Text className="text-lg text-teal-700 font-bold mt-4 mb-2">
            Product Image (Max size: 5MB)
          </Text>
          <TouchableOpacity
            onPress={pickImage}
            className="relative items-center mb-4"
          >
            {editProduct.productImage ? (
              <Image
                source={{ uri: editProduct.productImage }}
                style={{
                  width: 350,
                  height: 250,
                  borderRadius: 15,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.8,
                  shadowRadius: 5,
                  elevation: 5,
                }}
              />
            ) : (
              <LinearGradient
                colors={["#6DD5FA", "#FFFFFF"]}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: 150,
                  height: 150,
                  borderRadius: 15,
                  borderColor: "#ccc",
                  borderWidth: 2,
                }}
              >
                <Ionicons name="image-outline" size={60} color="#1DA1F2" />
                <Text className="text-gray-600 mt-2 font-semibold">
                  Upload Image
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Max size: 5MB
                </Text>
              </LinearGradient>
            )}
            <Text className="absolute bottom-2 text-white bg-black font-pbold px-2 py-1 rounded-full">
              Change Image
            </Text>
          </TouchableOpacity>
        </View>

        {/* Product Name */}
        <FormField
          title="Product Name *"
          value={editProduct.name}
          placeholder="Enter product name..."
          handleChangeText={(text) =>
            setEditProduct({ ...editProduct, name: text })
          }
        />

        {/* Categories (Chips) */}
        <View className="mb-4">
          <Text className="text-lg text-teal-700 font-bold mt-4 mb-2">
            Categories
          </Text>
          <View className="flex-row flex-wrap">
            {editProduct.category.map((category, index) => (
              <Chip
                key={index}
                mode="outlined"
                onClose={() => handleDeleteCategory(index)}
                style={{ margin: 2 }}
              >
                {category}
              </Chip>
            ))}
          </View>
          <Dropdown
            data={availableCategories.map((cat) => ({
              label: cat,
              value: cat,
            }))}
            labelField="label"
            valueField="value"
            placeholder="Select category"
            onChange={(item) =>
              setEditProduct({
                ...editProduct,
                category: [...editProduct.category, item.value],
              })
            }
            style={{
              borderColor: "#0d9488",
              borderWidth: 2,
              borderRadius: 8,
              padding: 16,
              marginTop: 5,
            }}
          />

          <TextInput
            placeholder="Add new category"
            value={newCategory}
            onChangeText={setNewCategory}
            className="w-full h-14 px-4 mt-2 bg-white rounded-xl border-2 border-teal-600 focus:border-secondary flex flex-row items-center text-black font-psemibold text-base"
          />

          <TouchableOpacity
            onPress={handleAddCategory}
            className="bg-teal-600 p-2 rounded-full flex-row items-center justify-center mt-2"
          >
            <Ionicons name="add-circle-outline" size={18} color="white" />
            <Text className="text-white ml-2">Add Category</Text>
          </TouchableOpacity>
        </View>

        {/* Price, Stock, Unit Dropdown */}
        <View className="mb-4">
          <FormField
            title="Price (₹)"
            value={String(editProduct.price)}
            placeholder="Enter price..."
            handleChangeText={(text) =>
              setEditProduct({ ...editProduct, price: text })
            }
            keyboardType="numeric"
          />

          <FormField
            title="Stock Quantity"
            value={String(editProduct.stockQuantity)}
            placeholder="Enter Stock Quantity..."
            handleChangeText={(text) =>
              setEditProduct({ ...editProduct, stockQuantity: text })
            }
            keyboardType="numeric"
          />

          <Text className="text-lg text-teal-700 font-bold mt-4 mb-2">
            Unit
          </Text>
          <Dropdown
            data={units}
            labelField="label"
            valueField="value"
            placeholder="Select unit"
            value={editProduct.unit}
            onChange={(item) =>
              setEditProduct({ ...editProduct, unit: item.value })
            }
            style={{
              borderColor: "#0d9488",
              borderWidth: 2,
              borderRadius: 8,
              padding: 16,
            }}
          />
        </View>

        {/* Product Description as Textarea */}
        <View className="mb-4">
          <Text className="text-lg text-teal-700 font-bold mt-4 mb-2">
            Product Description
          </Text>
          <TextInput
            value={editProduct.description}
            onChangeText={(text) =>
              setEditProduct({ ...editProduct, description: text })
            }
            placeholder="Enter product description..."
            multiline
            numberOfLines={4}
            className="w-full h-16 p-4 bg-white rounded-xl border-2 border-teal-600 focus:border-secondary flex flex-row items-center text-black font-psemibold text-base"
            style={{ height: 100, textAlignVertical: "top" }}
          />
        </View>

        {/* Variants Section */}
        <View className="mb-4">
          <Text className="text-lg text-teal-700 font-semibold mb-2">
            Variants
          </Text>
          {editProduct.variants.map((variant, index) => (
            <View key={index} className="mb-2">
              <Text className="font-medium">
                Variant: {variant.variantName}
              </Text>
              <Text>Price: ₹{variant.variantPrice}</Text>
              <Text>Stock: {variant.variantStockQuantity}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteVariant(index)}
                className="mt-1"
              >
                <Text className="text-red-500 font-psemibold underline">
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Variant Form */}
          <Dropdown
            data={variantOptions.map((option) => ({
              label: option,
              value: option,
            }))}
            labelField="label"
            valueField="value"
            placeholder="Select variant name"
            value={newVariant.variantName}
            onChange={(item) =>
              setNewVariant({ ...newVariant, variantName: item.value })
            }
            style={{
              borderColor: "#0d9488",
              borderWidth: 2,
              borderRadius: 8,
              padding: 16,
            }}
          />

          <TextInput
            placeholder="Variant Price"
            value={newVariant.variantPrice}
            onChangeText={(text) =>
              setNewVariant({ ...newVariant, variantPrice: text })
            }
            keyboardType="numeric"
            className="w-full h-14 px-4 mt-2 bg-white rounded-xl border-2 border-teal-600 focus:border-secondary flex flex-row items-center text-black font-psemibold text-base"
          />

          <TextInput
            placeholder="Stock Quantity"
            value={newVariant.variantStockQuantity}
            onChangeText={(text) =>
              setNewVariant({ ...newVariant, variantStockQuantity: text })
            }
            keyboardType="numeric"
            className="w-full h-14 px-4 mt-2 bg-white rounded-xl border-2 border-teal-600 focus:border-secondary flex flex-row items-center text-black font-psemibold text-base"
          />

          <TouchableOpacity
            onPress={handleAddVariant}
            className="bg-teal-600 p-2 rounded-full flex-row items-center justify-center mt-2"
          >
            <Ionicons name="add-circle-outline" size={18} color="white" />
            <Text className="text-white ml-2">Add Variant</Text>
          </TouchableOpacity>
        </View>

        {/* Discount and Tax */}
        <FormField
          title="Discount (%)"
          value={String(editProduct.discount)}
          placeholder="Enter Discount..."
          handleChangeText={(text) =>
            setEditProduct({ ...editProduct, discount: text })
          }
          keyboardType="numeric"
        />

        {/* Update Button */}
        <CustomButton
          title="Update Product"
          handlePress={handleUpdateProduct}
          isLoading={loading}
          containerStyles="mt-4"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductEditScreen;
