import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
} from "react-native";
import { CustomButton, FormField } from "../../components";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser, updateUser } from "../../redux/slices/userSlice";
import { router } from "expo-router";

const statesAndUTs = [
  { label: "Andhra Pradesh", value: "Andhra Pradesh" },
  { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
  { label: "Assam", value: "Assam" },
  { label: "Bihar", value: "Bihar" },
  { label: "Chhattisgarh", value: "Chhattisgarh" },
  { label: "Goa", value: "Goa" },
  { label: "Gujarat", value: "Gujarat" },
  { label: "Haryana", value: "Haryana" },
  { label: "Himachal Pradesh", value: "Himachal Pradesh" },
  { label: "Jharkhand", value: "Jharkhand" },
  { label: "Karnataka", value: "Karnataka" },
  { label: "Kerala", value: "Kerala" },
  { label: "Madhya Pradesh", value: "Madhya Pradesh" },
  { label: "Maharashtra", value: "Maharashtra" },
  { label: "Manipur", value: "Manipur" },
  { label: "Meghalaya", value: "Meghalaya" },
  { label: "Mizoram", value: "Mizoram" },
  { label: "Nagaland", value: "Nagaland" },
  { label: "Odisha", value: "Odisha" },
  { label: "Punjab", value: "Punjab" },
  { label: "Rajasthan", value: "Rajasthan" },
  { label: "Sikkim", value: "Sikkim" },
  { label: "Tamil Nadu", value: "Tamil Nadu" },
  { label: "Telangana", value: "Telangana" },
  { label: "Tripura", value: "Tripura" },
  { label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { label: "Uttarakhand", value: "Uttarakhand" },
  { label: "West Bengal", value: "West Bengal" },
  // Union Territories
  {
    label: "Andaman and Nicobar Islands",
    value: "Andaman and Nicobar Islands",
  },
  { label: "Chandigarh", value: "Chandigarh" },
  {
    label: "Dadra and Nagar Haveli and Daman and Diu",
    value: "Dadra and Nagar Haveli and Daman and Diu",
  },
  { label: "Lakshadweep", value: "Lakshadweep" },
  { label: "Delhi", value: "Delhi" },
  { label: "Puducherry", value: "Puducherry" },
  { label: "Ladakh", value: "Ladakh" },
  { label: "Jammu and Kashmir", value: "Jammu and Kashmir" },
];

const EditUser = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.user);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    shopLocation: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      latitude: "",
      longitude: "",
    },
  });

  // Fetch user data
  useEffect(() => {
    dispatch(fetchUser(user._id));
  }, [user._id]);

  // Load data into the form
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        mobile: user.mobile || "",
        shopLocation: {
          street: user.shopLocation?.address.street || "",
          city: user.shopLocation?.address.city || "",
          state: user.shopLocation?.address.state || "",
          postalCode: user.shopLocation?.address.postalCode || "",
          country: user.shopLocation?.address.country || "India",
          latitude: user.shopLocation?.googleMapLocation.latitude || "",
          longitude: user.shopLocation?.googleMapLocation.longitude || "",
        },
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    // Check for required fields
    if (
      form.name === "" ||
      form.mobile === "" ||
      form.shopLocation.street === "" ||
      form.shopLocation.city === "" ||
      form.shopLocation.state === "" ||
      form.shopLocation.postalCode === ""
    ) {
      return Alert.alert("Error", "Please fill in all required fields.");
    }

    // Mobile validation
    if (!/^\d{10}$/.test(form.mobile)) {
      return Alert.alert(
        "Invalid Input",
        "Enter a valid 10-digit phone number."
      );
    }

    // Dispatch updateUser and handle response
    try {
      await dispatch(
        updateUser({ userId: user._id, userData: { ...form } })
      ).unwrap();

      if (router.canGoBack()) {
        router.back();
      } else {
        router.push("/settings");
      }
      Alert.alert("Success", "User details have been updated.");
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", error || "Something went wrong.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="teal" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white h-full p-4">
      <ScrollView>
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push("/home");
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color="teal" />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold text-teal-700 ml-2">
            Edit User
          </Text>
        </View>

        {/* Form Fields */}
        <FormField
          title="Name *"
          value={form.name}
          placeholder="Enter name..."
          handleChangeText={(e) => setForm({ ...form, name: e })}
        />

        <FormField
          title="Mobile Number *"
          value={form.mobile}
          placeholder="Enter mobile number..."
          handleChangeText={(e) =>
            setForm({ ...form, mobile: e.replace(/[^0-9]/g, "") })
          }
          keyboardType="numeric"
        />

        <FormField
          title="Street Address *"
          value={form.shopLocation.street}
          placeholder="Enter street address..."
          handleChangeText={(e) =>
            setForm({
              ...form,
              shopLocation: { ...form.shopLocation, street: e },
            })
          }
        />

        <FormField
          title="City *"
          value={form.shopLocation.city}
          placeholder="Enter city..."
          handleChangeText={(e) =>
            setForm({
              ...form,
              shopLocation: { ...form.shopLocation, city: e },
            })
          }
        />

        <Text className="text-lg text-teal-700 font-bold mt-5 mb-2">
          State/Union Territory *
        </Text>
        <Dropdown
          data={statesAndUTs}
          labelField="label"
          valueField="value"
          value={form.shopLocation.state}
          onChange={(item) =>
            setForm({
              ...form,
              shopLocation: { ...form.shopLocation, state: item.value },
            })
          }
          style={{
            borderColor: "#0d9488",
            borderWidth: 2,
            borderRadius: 8,
            padding: 16,
          }}
        />

        <FormField
          title="Postal Code *"
          value={form.shopLocation.postalCode}
          placeholder="Enter postal code..."
          handleChangeText={(e) =>
            setForm({
              ...form,
              shopLocation: {
                ...form.shopLocation,
                postalCode: e.replace(/[^0-9]/g, ""),
              },
            })
          }
          keyboardType="numeric"
        />

        <FormField
          title="Latitude (Optional)"
          value={form.shopLocation.latitude}
          placeholder="Enter latitude..."
          handleChangeText={(e) =>
            setForm({
              ...form,
              shopLocation: { ...form.shopLocation, latitude: e },
            })
          }
        />

        <FormField
          title="Longitude (Optional)"
          value={form.shopLocation.longitude}
          placeholder="Enter longitude..."
          handleChangeText={(e) =>
            setForm({
              ...form,
              shopLocation: { ...form.shopLocation, longitude: e },
            })
          }
        />

        {/* Submit Button */}
        <CustomButton
          title="Update User"
          handlePress={handleSubmit}
          isLoading={loading}
          containerStyles="mt-4"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditUser;
