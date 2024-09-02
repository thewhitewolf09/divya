import { useState } from "react";
import { Redirect, Link, router } from "expo-router";
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
} from "react-native";
import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

const SignIn = () => {
  const { loading, isLogged, requestOtp, loginWithOtp } = useGlobalContext();

  if (!loading && isLogged) return <Redirect href="/home" />;

  const [isSubmitting, setSubmitting] = useState(false);
  const [isOtpRequested, setOtpRequested] = useState(false);
  const [form, setForm] = useState({
    mobileNumber: "",
    otp: "",
  });

  const handleRequestOtp = async () => {
    if (form.mobileNumber === "") {
      Alert.alert("Error", "Please enter your mobile number");
      return;
    }

    setSubmitting(true);

    try {
      await requestOtp(form.mobileNumber); // Call to request OTP
      setOtpRequested(true); // Show OTP field after requesting OTP
      Alert.alert("Success", "OTP sent to your mobile number");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (form.mobileNumber === "" || (isOtpRequested && form.otp === "")) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSubmitting(true);

    try {
      await loginWithOtp(form.mobileNumber, form.otp);
      Alert.alert("Success", "User signed in successfully");
      router.replace("/home");
    } catch (error) {
      Alert.alert("Error in login", error.message);
    } finally {
      setSubmitting(false);
    }
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
            height: "100%",
          }}
        >
          <View
            className="w-full flex justify-center h-full px-4 my-6"
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

            <Text className="text-2xl font-semibold text-black mt-10 font-psemibold">
              Log in to Divya
            </Text>

            {/* Mobile Number Input */}
            <FormField
              title="Mobile Number"
              value={form.mobileNumber}
              handleChangeText={(e) => setForm({ ...form, mobileNumber: e })}
              otherStyles="mt-7"
              keyboardType="phone-pad"
              placeholder="Enter your mobile number"
            />

            {/* OTP Input (conditionally rendered) */}
            {isOtpRequested && (
              <FormField
                title="OTP"
                value={form.otp}
                handleChangeText={(e) => setForm({ ...form, otp: e })}
                otherStyles="mt-7"
                keyboardType="numeric"
              />
            )}

            {/* Button for requesting OTP or submitting */}
            <CustomButton
              title={isOtpRequested ? "Submit OTP" : "Request OTP"}
              handlePress={isOtpRequested ? handleSubmit : handleRequestOtp}
              containerStyles="mt-7"
              isLoading={isSubmitting}
            />

            <View className="flex justify-center pt-5 flex-row gap-2">
              <Text className="text-lg text-gray-100 font-pregular">
                Don't have an account?
              </Text>
              <Link
                href="/sign-up"
                className="text-lg font-psemibold text-teal-600"
              >
                Signup
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
