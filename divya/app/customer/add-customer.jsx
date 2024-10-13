import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { CustomButton, FormField } from "../../components";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { router, useNavigation } from "expo-router";
import { useDispatch } from "react-redux";
import { createCustomer } from "../../redux/slices/customerSlice";

const AddCustomer = () => {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    whatsappNumber: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    notes: "",
  });
  const dispatch = useDispatch();

  // Indian States and Union Territories
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

  // Helper function to update form fields
  const setFormField = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  // Submit Form
  const handleSubmit = async () => {
    if (
      form.name === "" ||
      form.mobile === "" ||
      form.street === "" ||
      form.city === "" ||
      form.state === "" ||
      form.postalCode === ""
    ) {
      return Alert.alert("Please fill in all required fields.");
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      return Alert.alert("Please enter a valid 10-digit mobile number.");
    }

    setUploading(true);

    const customerData = {
      name: form.name,
      mobile: form.mobile,
      whatsappNumber: form.whatsappNumber,
      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
      },
      notes: form.notes,
    };

    try {
      await dispatch(createCustomer(customerData)).unwrap();

      setUploading(false);
      Alert.alert("Success", "Customer added successfully!");
      router.push("/home");
    } catch (error) {
      setUploading(false);
      Alert.alert("Error", error?.message || "Failed to add customer.");
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
            Add Customer
          </Text>
        </View>

        {/* Customer Name */}
        <FormField
          title="Customer Name *"
          value={form.name}
          placeholder="Enter customer name..."
          handleChangeText={(e) => setFormField("name", e)}
        />

        {/* Mobile */}
        <FormField
          title="Mobile Number *"
          value={form.mobile}
          placeholder="Enter mobile number..."
          handleChangeText={(e) =>
            setFormField("mobile", e.replace(/[^0-9]/g, ""))
          }
          keyboardType="numeric"
        />

        {/* WhatsApp Number */}
        <FormField
          title="WhatsApp Number"
          value={form.whatsappNumber}
          placeholder="Enter WhatsApp number (optional)..."
          handleChangeText={(e) =>
            setFormField("whatsappNumber", e.replace(/[^0-9]/g, ""))
          }
          keyboardType="numeric"
        />

        {/* Address Fields */}
        <FormField
          title="Street Address *"
          value={form.street}
          placeholder="Enter street address..."
          handleChangeText={(e) => setFormField("street", e)}
        />
        <FormField
          title="City *"
          value={form.city}
          placeholder="Enter city..."
          handleChangeText={(e) => setFormField("city", e)}
        />

        {/* State Dropdown */}

        <Text className="text-lg text-teal-700 font-bold mt-4 mb-2">
          State *
        </Text>
        <Dropdown
          data={statesAndUTs}
          value={form.state}
          labelField="label"
          valueField="value"
          placeholder="Select state *"
          onChange={(item) => setFormField("state", item.value)}
          style={{
            borderColor: "#0d9488",
            borderWidth: 2,
            borderRadius: 8,
            padding: 16,
          }}
        />

        <FormField
          title="Postal Code *"
          value={form.postalCode}
          placeholder="Enter postal code..."
          handleChangeText={(e) =>
            setFormField("postalCode", e.replace(/[^0-9]/g, ""))
          }
          keyboardType="numeric"
        />

        {/* Country */}
        <FormField
          title="Country"
          value={form.country}
          placeholder="Enter country..."
          handleChangeText={(e) => setFormField("country", e)}
        />

        {/* Notes */}
        <View className="mb-4">
          <Text className="text-lg text-teal-700 font-bold mt-4 mb-2">
            Notes
          </Text>
          <TextInput
            value={form.notes}
            onChangeText={(e) => setFormField("notes", e)}
            placeholder="Enter any additional notes (optional)..."
            multiline
            numberOfLines={4}
            className="w-full h-16 p-4 bg-white rounded-xl border-2 border-teal-600 focus:border-secondary flex flex-row items-center text-black font-psemibold text-base"
            style={{ height: 100, textAlignVertical: "top" }}
          />
        </View>

        {/* Submit Button */}
        <CustomButton
          title="Add Customer"
          handlePress={handleSubmit}
          isLoading={uploading}
          containerStyles="mt-7"
          disabled={uploading} // Prevent multiple submissions
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddCustomer;
