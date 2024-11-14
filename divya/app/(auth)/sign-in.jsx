import { useState, useEffect } from "react";
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
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import {
  loginUser,
  sendOtpUser,
  verifyOtpUser,
} from "../../redux/slices/userSlice";
import { useNotifications } from "../../notification/notification";

const SignIn = () => {
  const dispatch = useDispatch();
  const { loading, user, error } = useSelector((state) => state.user); // Redux state

  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    mobileNumber: "",
    otp: "",
  });

  const { expoPushToken } = useNotifications();


  const [timer, setTimer] = useState(15); // Resend OTP timer
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

  const handleRequestOtp = async () => {
    if (form.mobileNumber === "") {
      Alert.alert("Error", "Please enter your mobile number");
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(
        loginUser({ mobile: form.mobileNumber, deviceToken: expoPushToken })
      ).unwrap(); // Dispatch OTP request
      Alert.alert("Success", "OTP sent to your mobile number");
      setOtpSent(true);
      setTimer(15); // Reset the timer for resending OTP
      setCanResend(false);
    } catch (error) {
      Alert.alert("Error", error || "Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      await dispatch(sendOtpUser(form.mobileNumber)).unwrap(); // Resend OTP
      setTimer(15); // Reset the timer again
      setCanResend(false);
    } catch (error) {
      Alert.alert("Error", error || "Failed to resend OTP");
    }
  };

  const handleSubmit = async () => {
    if (form.mobileNumber === "" || (otpSent && form.otp === "")) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(
        verifyOtpUser({ mobile: form.mobileNumber, otp: form.otp })
      ).unwrap();
      router.replace("/home");
      setOtpSent(false);
    } catch (error) {
      Alert.alert("Error", error || "Failed to login");
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

            <Text className="text-2xl font-semibold text-black font-psemibold">
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
            {otpSent && (
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
              title={otpSent ? "Submit OTP" : "Request OTP"}
              handlePress={otpSent ? handleSubmit : handleRequestOtp}
              containerStyles="mt-7"
              isLoading={isSubmitting}
            />

            {/* OTP Resend Logic */}
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
