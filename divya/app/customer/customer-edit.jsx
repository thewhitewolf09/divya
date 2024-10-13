import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { CustomButton, FormField } from "../../components";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Chip } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerDetails,
  updateCustomer,
} from "../../redux/slices/customerSlice";

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

const EditCustomer = () => {
  const { customerId } = useLocalSearchParams();
  const dispatch = useDispatch();
  const { customer, loading, error } = useSelector((state) => state.customer);

  const [uploading, setUploading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState("inactive");
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
    totalPurchases: 0,
    creditBalance: 0,
  });

  const navigation = useNavigation();

  const fetchCustomer = async (customerId) => {
    await dispatch(fetchCustomerDetails(customerId));
  };

  useEffect(() => {
    fetchCustomer(customerId);
  }, [customerId]);

  // Load customer data from Redux store
  useEffect(() => {
    if (customer && customer.address) {
      setForm({
        name: customer.name || "",
        mobile: customer.mobile || "",
        whatsappNumber: customer.whatsappNumber || "",
        street: customer.address.street || "",
        city: customer.address.city || "",
        state: customer.address.state || "",
        postalCode: customer.address.postalCode || "",
        country: customer.address.country || "India",
        notes: customer.notes || "",
        totalPurchases: customer.totalPurchases || 0,
        creditBalance: customer.creditBalance || 0,
      });
      setIsActive(customer.isActive || false);
      setMembershipStatus(customer.membershipStatus || "inactive");
    }
  }, [customer]);

  // Handle form submission
  const handleSubmit = () => {
    if (
      form.name === "" ||
      form.mobile === "" ||
      form.street === "" ||
      form.city === "" ||
      form.state === "" ||
      form.postalCode === ""
    ) {
      return Alert.alert("Error", "Please fill in all required fields.");
    }
  
    if (!/^\d{10}$/.test(form.mobile)) {
      return Alert.alert(
        "Invalid Input",
        "Please enter a valid 10-digit phone number."
      );
    }
  
    setUploading(true);
  
    // Dispatch action to update the customer in the Redux store
    dispatch(
      updateCustomer({
        id: customerId,
        customerData: { 
          ...form,
          isActive,
          membershipStatus,
        },
      })
    );
  
    // Simulate data submission process
    setTimeout(() => {
      Alert.alert("Success", "Customer data has been updated.");
      setUploading(false);
      navigation.goBack();
    }, 1000);
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
        {/* Header and back button */}
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
            Edit Customer
          </Text>
        </View>

        {/* Form Fields */}
        <FormField
          title="Customer Name *"
          value={form.name}
          placeholder="Enter customer name..."
          handleChangeText={(e) => setForm({ ...form, name: e })}
        />

        <FormField
          title="Phone Number *"
          value={form.mobile}
          placeholder="Enter phone number..."
          handleChangeText={(e) =>
            setForm({ ...form, mobile: e.replace(/[^0-9]/g, "") })
          }
          keyboardType="numeric"
          editable={false}
        />

        <FormField
          title="WhatsApp Number"
          value={form.whatsappNumber}
          placeholder="Enter WhatsApp number (optional)..."
          handleChangeText={(e) =>
            setForm({ ...form, whatsappNumber: e.replace(/[^0-9]/g, "") })
          }
          keyboardType="numeric"
        />

        <FormField
          title="Street Address *"
          value={form.street}
          placeholder="Enter street address..."
          handleChangeText={(e) => setForm({ ...form, street: e })}
        />

        <FormField
          title="City *"
          value={form.city}
          placeholder="Enter city..."
          handleChangeText={(e) => setForm({ ...form, city: e })}
        />

        {/* State dropdown */}
        <Text className="text-lg text-teal-700 font-bold mt-5 mb-2">
          State/Union Territory *
        </Text>
        <Dropdown
          data={statesAndUTs}
          labelField="label"
          valueField="value"
          value={form.state}
          onChange={(item) => setForm({ ...form, state: item.value })}
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
            setForm({ ...form, postalCode: e.replace(/[^0-9]/g, "") })
          }
          keyboardType="numeric"
        />

        {/* Notes section */}
        <View className="mt-7">
          <Text className="text-lg text-teal-700 font-bold mb-2">Notes</Text>
          <TextInput
            value={form.notes}
            placeholder="Add any notes (optional)..."
            onChangeText={(e) => setForm({ ...form, notes: e })}
            className="w-full h-16 p-4 bg-white rounded-xl border-2 border-teal-600 focus:border-secondary flex flex-row items-center text-black font-psemibold text-base"
            style={{ height: 100, textAlignVertical: "top" }}
            multiline={true}
            numberOfLines={4}
          />
        </View>

    

        {/* Toggle for Active Status */}
        <View className="flex-row items-center justify-between mt-4 mb-6">
          <Text className="text-lg text-teal-700 font-bold ">
            Active Status
          </Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>

        {/* Membership Status dropdown */}
        <Text className="text-lg text-teal-700 font-bold mb-4">
          Membership Status
        </Text>
        <Dropdown
          data={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
          labelField="label"
          valueField="value"
          value={membershipStatus}
          onChange={(item) => setMembershipStatus(item.value)}
          style={{
            borderColor: "#0d9488",
            borderWidth: 2,
            borderRadius: 8,
            padding: 16,
          }}
        />

        {/* Submit Button */}
        <CustomButton
          title="Update Customer"
          handlePress={handleSubmit}
          isLoading={loading}
          containerStyles="mt-4"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditCustomer;
