import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { CustomButton, FormField } from "../../components";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { LinearGradient } from "expo-linear-gradient";
import { router, useNavigation } from "expo-router";
import { Chip } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  addProduct,
  uploadProductImage,
} from "../../redux/slices/productSlice";

const AddProduct = () => {
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: [],
    price: "",
    stock: "",
    unit: "kg",
    description: "",
    variants: "",
  });

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.product);

  const units = [
    { label: "kg", value: "kg" },
    { label: "liter", value: "liter" },
    { label: "piece", value: "piece" },
    { label: "pack", value: "pack" },
    { label: "dozen", value: "dozen" },
  ];

  const variantOptions = [
    { label: "Small", value: "small" },
    { label: "Medium", value: "medium" },
    { label: "Large", value: "large" },
  ];

  const availableCategories = ["Milk", "Sweet", "Namkeen", "Shake", "Juice"];

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1, // This is the original quality setting
    });

    if (!result.canceled) {
      // Compress and resize the image
      const compressedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }], // Resize the image (e.g., width of 800px)
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress the image
      );

      // Get file info to check the size
      const fileInfo = await FileSystem.getInfoAsync(compressedImage.uri);

      // Check if the compressed image size is under 5MB
      if (fileInfo.size <= 5 * 1024 * 1024) {
        setImageUri(compressedImage.uri);
      } else {
        Alert.alert("Error", "Image size must be less than 5MB.");
      }
    } else {
      Alert.alert("Error", "No image selected.");
    }
  };


  const handleAddCategory = (newCategory) => {
    const trimmedCategory = newCategory.trim();
    if (trimmedCategory && !form.category.includes(trimmedCategory)) {
      setForm({ ...form, category: [...form.category, trimmedCategory] });
    }
  };
  

  const handleRemoveCategory = (category) => {
    setForm({
      ...form,
      category: form.category.filter((cat) => cat !== category),
    });
  };

  const handleCategoryInput = (text) => {
    const trimmedText = text.trim();
    if (trimmedText) {
      handleAddCategory(trimmedText);
    }
  };

  const handleSubmit = async () => {
    // Basic form validation
    if (
      form.name === "" ||
      form.category.length === 0 ||
      form.price === "" ||
      form.stock === ""
    ) {
      return Alert.alert("Please fill in all fields.");
    }

    setUploading(true);

    try {
      // Prepare product data for submission
      const productData = {
        ...form,
        price: parseFloat(form.price), // Ensure price is a float
        stockQuantity: parseInt(form.stock), // Ensure stock is an integer
        variants: form.variants.split(",").map((variant) => ({
          variantName: variant.trim(),
          variantPrice: parseFloat(form.price), // Optionally, you can allow different prices for variants
          variantStockQuantity: parseInt(form.stock), // Set variant stock quantity
        })),
      };

      // Dispatch Redux action to add the product
      const resultAction = await dispatch(addProduct(productData));

      // Check if the product was successfully added
      if (addProduct.fulfilled.match(resultAction)) {
        const productId = resultAction.payload.product._id;

        // If there's an image, handle image upload
        if (imageUri) {
          const imageData = new FormData();

          imageData.append("file", {
            uri: imageUri,
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
            router.replace("/home");
            Alert.alert("Success", "Product and image uploaded successfully!");
          } else {
            Alert.alert("Error", "Product added but image upload failed.");
          }
        } else {
          Alert.alert("Success", "Product added successfully!");
        }

        // Redirect or navigate back
        //router.replace("/home");
      } else {
        Alert.alert("Error", resultAction.payload || "Failed to add product.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add product.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full p-4">
      <ScrollView>
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
            <Ionicons name="chevron-back" size={24} color="teal" />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold text-teal-700">
            Add Product
          </Text>
        </View>

        {/* Stylish Image Upload */}
        <View className="mb-6">
          <Text className="text-lg text-teal-700 font-semibold mb-2">
            Product Image (Max size: 5MB)
          </Text>
          <Text className="text-sm text-gray-500 mb-4">
            Upload a clear image of the product. Supported formats: JPG, PNG.
          </Text>

          <TouchableOpacity onPress={pickImage} className="items-center">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: 150,
                  height: 150,
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
          </TouchableOpacity>
        </View>

        {/* Product Name */}
        <FormField
          title="Product Name *"
          value={form.name}
          placeholder="Enter product name..."
          handleChangeText={(e) => setForm({ ...form, name: e })}
          otherStyles="mt-7"
        />

        {/* Category Selector */}
        <Text className="text-lg text-teal-700 font-semibold mt-5 mb-2">
          Categories (Tags) *
        </Text>

        <ScrollView horizontal>
          {form.category.map((category, index) => (
            <Chip
              key={index}
              mode="outlined"
              onClose={() => handleRemoveCategory(category)}
              style={{ marginRight: 5 }}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>

        <Dropdown
          data={availableCategories.map((cat) => ({ label: cat, value: cat }))}
          labelField="label"
          valueField="value"
          placeholder="Select or add categories..."
          value={null}
          onChange={(item) => handleAddCategory(item.value)}
          style={{
            borderColor: "gray",
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            marginTop: 10,
          }}
        />

        {/* Option to add new category */}
        <TextInput
          placeholder="Create new category..."
          onSubmitEditing={(e) => handleCategoryInput(e.nativeEvent.text)}
          style={{
            borderColor: "gray",
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            marginTop: 10,
          }}
        />

        {/* Price with Currency */}
        <FormField
          title="Price(₹) *"
          value={form.price}
          placeholder="Enter price..."
          handleChangeText={(e) =>
            setForm({ ...form, price: e.replace(/[^0-9.]/g, "") })
          }
          otherStyles="mt-7"
          keyboardType="numeric"
        />

        {/* Stock Quantity (Numeric Input) */}
        <FormField
          title="Stock Quantity *"
          value={form.stock}
          placeholder="Enter stock quantity..."
          handleChangeText={(e) =>
            setForm({ ...form, stock: e.replace(/[^0-9]/g, "") })
          }
          keyboardType="numeric"
          otherStyles="mt-7"
        />

        {/* Unit Dropdown */}
        <Text className="text-lg text-teal-700 font-semibold mt-5 mb-2">
          Unit *
        </Text>
        <Dropdown
          data={units}
          labelField="label"
          valueField="value"
          value={form.unit}
          onChange={(item) => setForm({ ...form, unit: item.value })}
          style={{
            borderColor: "gray",
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
          }}
        />

        {/* Description TextArea */}
        <View className="mt-7">
          <Text className="text-lg text-teal-700 font-semibold mb-2">
            Description
          </Text>
          <TextInput
            value={form.description}
            placeholder="Enter product description..."
            onChangeText={(e) => setForm({ ...form, description: e })}
            style={{
              borderColor: "gray",
              borderWidth: 1,
              borderRadius: 5,
              padding: 10,
              height: 100,
              textAlignVertical: "top",
            }}
            multiline={true}
            numberOfLines={4}
          />
        </View>

        {/* Variants Dropdown */}
        <Text className="text-lg text-teal-700 font-semibold mt-5 mb-2">
          Variants *
        </Text>
        <Dropdown
          data={variantOptions}
          labelField="label"
          valueField="value"
          value={form.variants}
          onChange={(item) => setForm({ ...form, variants: item.value })}
          style={{
            borderColor: "gray",
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
          }}
        />

        {/* Add Product Button */}
        <CustomButton
          title="Add Product"
          handlePress={handleSubmit}
          isLoading={uploading}
          containerStyles="mt-7"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddProduct;
