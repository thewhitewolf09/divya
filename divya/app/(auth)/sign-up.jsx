import React, { useState, useEffect } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Switch,
} from "react-native";
import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { useDispatch, useSelector } from "react-redux";
import {
  sendOtpUser,
  signupUser,
  verifyOtpUser,
} from "../../redux/slices/userSlice";

const SignUp = () => {
  const dispatch = useDispatch();
  const { loading, isLogged, verified, error } = useSelector(
    (state) => state.user
  );

  const [form, setForm] = useState({
    name: "",
    mobileNumber: "",
    otp: "",
    role: "customer", // Default role
    // Shop Owner Fields
    shopStreet: "",
    shopCity: "",
    shopState: "",
    shopPostalCode: "",
    shopCountry: "India",
    openingTime: "",
    closingTime: "",
    // Customer Fields
    whatsappNumber: "",
    customerStreet: "",
    customerCity: "",
    customerState: "",
    customerPostalCode: "",
    customerCountry: "India",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(15);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSignUp = () => {
    // Basic Validation
    if (form.name === "" || form.mobileNumber === "") {
      Alert.alert("Error", "Please enter your name and mobile number");
      return;
    }

    // Mobile Number Validation
    const mobilePattern = /^[0-9]{10}$/;
    if (!mobilePattern.test(form.mobileNumber)) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number");
      return;
    }

    // Role-Specific Validation
    if (form.role === "shopOwner") {
      if (
        form.shopStreet === "" ||
        form.shopCity === "" ||
        form.shopState === "" ||
        form.shopPostalCode === "" ||
        form.openingTime === "" ||
        form.closingTime === ""
      ) {
        Alert.alert(
          "Error",
          "Please enter all required shop details (address, opening and closing times)"
        );
        return;
      }

      // Postal Code Validation for Shop
      const postalPattern = /^[0-9]{6}$/;
      if (!postalPattern.test(form.shopPostalCode)) {
        Alert.alert(
          "Error",
          "Please enter a valid 6-digit postal code for shop"
        );
        return;
      }
    } else if (form.role === "customer") {
      if (
        form.customerStreet === "" ||
        form.customerCity === "" ||
        form.customerState === "" ||
        form.customerPostalCode === ""
      ) {
        Alert.alert(
          "Error",
          "Please enter all required customer address details"
        );
        return;
      }

      // Postal Code Validation for Customer
      const postalPattern = /^[0-9]{6}$/;
      if (!postalPattern.test(form.customerPostalCode)) {
        Alert.alert(
          "Error",
          "Please enter a valid 6-digit postal code for customer"
        );
        return;
      }

      // WhatsApp Number Validation (Optional)
      if (form.whatsappNumber !== "") {
        const whatsappPattern = /^[0-9]{10}$/;
        if (!whatsappPattern.test(form.whatsappNumber)) {
          Alert.alert("Error", "Please enter a valid 10-digit WhatsApp number");
          return;
        }
      }
    }

    // Prepare Sign-Up Data
    const signUpData = {
      name: form.name,
      mobile: form.mobileNumber,
      role: form.role,
    };

    // Add Role-Specific Data
    if (form.role === "shopOwner") {
      signUpData.shopLocation = {
        address: {
          street: form.shopStreet,
          city: form.shopCity,
          state: form.shopState,
          postalCode: form.shopPostalCode,
          country: form.shopCountry,
        },
        googleMapLocation: {
          latitude: 0, // Default or fetch from a map picker
          longitude: 0,
        },
      };
      signUpData.openingTime = form.openingTime;
      signUpData.closingTime = form.closingTime;
    } else if (form.role === "customer") {
      signUpData.whatsappNumber = form.whatsappNumber || null;
      signUpData.address = {
        street: form.customerStreet,
        city: form.customerCity,
        state: form.customerState,
        postalCode: form.customerPostalCode,
        country: form.customerCountry,
      };
    }

    // Dispatch Sign-Up Action
    dispatch(signupUser(signUpData))
      .unwrap()
      .then(() => {
        setOtpSent(true);
        setTimer(15);
        setCanResend(false);
      })
      .catch((error) => {
        Alert.alert("Error", error || "Failed to send OTP");
      });
  };

  const handleVerifyOtp = () => {
    if (form.mobileNumber === "" || form.otp === "") {
      Alert.alert("Error", "Please enter the OTP and mobile number");
      return;
    }

    dispatch(verifyOtpUser({ mobile: form.mobileNumber, otp: form.otp }))
      .unwrap()
      .then(() => {
        // Redirect based on role
        if (form.role === "shopOwner") {
          router.replace("/home");
        } else if (form.role === "customer") {
          router.replace("/home");
        }
        setOtpSent(false);
      })
      .catch((error) => {
        Alert.alert("Error", error || "Failed to verify OTP");
      });
  };

  const handleResendOtp = () => {
    if (!canResend) return;

    dispatch(sendOtpUser(form.mobileNumber))
      .unwrap()
      .then(() => {
        setTimer(15);
        setCanResend(false);
      })
      .catch((error) => {
        Alert.alert("Error", error || "Failed to resend OTP");
      });
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View
            className="w-full flex justify-center h-full my-6"
            style={{
              minHeight: Dimensions.get("window").height - 100,
            }}
          >
            <Image
              source={images.logo}
              className="w-[130px] h-[84px] self-center"
              resizeMode="contain"
            />

            <Image
              source={images.cards}
              className="max-w-[380px] w-full h-[298px]"
              resizeMode="contain"
            />

            <Text className="text-2xl font-semibold text-black font-psemibold text-left mt-4">
              Sign Up to Divya
            </Text>

            {/* Conditional Form Fields */}
            {form.role === "shopOwner" && (
              <View className="w-full">
                <FormField
                  title="Shop Name"
                  value={form.name}
                  handleChangeText={(e) => setForm({ ...form, name: e })}
                  otherStyles="mt-7"
                  placeholder="Enter your name"
                />
                {/* Mobile Number Field */}
                <FormField
                  title="Mobile Number"
                  value={form.mobileNumber}
                  handleChangeText={(e) =>
                    setForm({ ...form, mobileNumber: e })
                  }
                  keyboardType="phone-pad"
                  placeholder="Enter your mobile number"
                />
                <FormField
                  title="Shop Street"
                  value={form.shopStreet}
                  handleChangeText={(e) => setForm({ ...form, shopStreet: e })}
                  placeholder="Enter shop street"
                  otherStyles="mt-7"
                />
                <FormField
                  title="Shop City"
                  value={form.shopCity}
                  handleChangeText={(e) => setForm({ ...form, shopCity: e })}
                  placeholder="Enter shop city"
                />
                <FormField
                  title="Shop State"
                  value={form.shopState}
                  handleChangeText={(e) => setForm({ ...form, shopState: e })}
                  placeholder="Enter shop state"
                />
                <FormField
                  title="Shop Postal Code"
                  value={form.shopPostalCode}
                  handleChangeText={(e) =>
                    setForm({ ...form, shopPostalCode: e })
                  }
                  keyboardType="number-pad"
                  placeholder="Enter shop postal code"
                />
                <FormField
                  title="Shop Opening Time"
                  value={form.openingTime}
                  handleChangeText={(e) => setForm({ ...form, openingTime: e })}
                  placeholder="e.g., 09:00 AM"
                />
                <FormField
                  title="Shop Closing Time"
                  value={form.closingTime}
                  handleChangeText={(e) => setForm({ ...form, closingTime: e })}
                  placeholder="e.g., 06:00 PM"
                />
              </View>
            )}

            {form.role === "customer" && (
              <View className="w-full">
                <FormField
                  title="Name"
                  value={form.name}
                  handleChangeText={(e) => setForm({ ...form, name: e })}
                  otherStyles="mt-7"
                  placeholder="Enter your name"
                />
                {/* Mobile Number Field */}
                <FormField
                  title="Mobile Number"
                  value={form.mobileNumber}
                  handleChangeText={(e) =>
                    setForm({ ...form, mobileNumber: e })
                  }
                  otherStyles=""
                  keyboardType="phone-pad"
                  placeholder="Enter your mobile number"
                />
                <FormField
                  title="WhatsApp Number (Optional)"
                  value={form.whatsappNumber}
                  handleChangeText={(e) =>
                    setForm({ ...form, whatsappNumber: e })
                  }
                  keyboardType="phone-pad"
                  otherStyles="mt-7"
                  placeholder="Enter WhatsApp number"
                />
                <FormField
                  title="Address Street"
                  value={form.customerStreet}
                  handleChangeText={(e) =>
                    setForm({ ...form, customerStreet: e })
                  }
                  placeholder="Enter street address"
                />
                <FormField
                  title="Address City"
                  value={form.customerCity}
                  handleChangeText={(e) =>
                    setForm({ ...form, customerCity: e })
                  }
                  placeholder="Enter city"
                />
                <FormField
                  title="Address State"
                  value={form.customerState}
                  handleChangeText={(e) =>
                    setForm({ ...form, customerState: e })
                  }
                  placeholder="Enter state"
                />
                <FormField
                  title="Address Postal Code"
                  value={form.customerPostalCode}
                  handleChangeText={(e) =>
                    setForm({ ...form, customerPostalCode: e })
                  }
                  keyboardType="number-pad"
                  placeholder="Enter postal code"
                />
              </View>
            )}

            {/* OTP Field */}
            {otpSent && (
              <FormField
                title="OTP"
                value={form.otp}
                handleChangeText={(e) => setForm({ ...form, otp: e })}
                otherStyles="mt-7"
                keyboardType="numeric"
                placeholder="Enter OTP"
              />
            )}

            {/* Sign Up / Verify OTP Button */}
            <CustomButton
              title={otpSent ? "Verify OTP" : "Sign Up"}
              handlePress={otpSent ? handleVerifyOtp : handleSignUp}
              containerStyles="mt-7"
              isLoading={loading}
              disabled={loading}
            />

            {/* Resend OTP */}
            {otpSent && (
              <View className="mt-3">
                <Text style={{ textAlign: "center", marginBottom: 10 }}>
                  {timer > 0
                    ? `Resend OTP available in ${timer}s`
                    : "Didn’t receive the OTP?"}
                </Text>
                {timer === 0 && (
                  <TouchableOpacity onPress={handleResendOtp}>
                    <Text
                      style={{
                        color: "teal",
                        fontWeight: "bold",
                        textAlign: "center",
                        textDecorationLine: "underline",
                      }}
                    >
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Navigate to Login */}
            <View className="flex justify-center pt-5 flex-row gap-2">
              <Text className="text-lg text-gray-500">
                Already have an account?
              </Text>
              <Link
                href="/sign-in"
                className="text-lg font-semibold text-teal-600"
              >
                Login
              </Link>
            </View>

            {/* Role Selection */}
            <View className="flex justify-center items-center mt-6 flex-row gap-2">
              <TouchableOpacity
                onPress={() =>
                  setForm({
                    ...form,
                    role: form.role === "customer" ? "shopOwner" : "customer",
                  })
                }
              >
                <Text className="text-lg text-gray-600">
                  {form.role === "customer" ? "I am a " : "I am a "}
                  <Text className="font-semibold underline text-teal-600">
                    {form.role === "customer" ? "Shop Owner" : "Customer"}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
