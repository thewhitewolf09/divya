import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

// Sample FAQs array
const faqs = [
  {
    question: "How can I reset my password?",
    answer:
      "To reset your password, go to Account Settings, and select 'Change Password'. Follow the prompts to complete the process.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can contact customer support via the 'Help & Support' section, by phone, or email us at support@example.com.",
  },
  {
    question: "How do I update my app?",
    answer:
      "To update your app, go to Settings and click on 'Update App'. If there is a new version available, follow the prompts to install the latest version.",
  },
  {
    question: "What should I do if I encounter a bug?",
    answer:
      "If you encounter a bug, please report it via the 'Help & Support' section. Include as many details as possible.",
  },
  {
    question: "Can I sync my data across multiple devices?",
    answer:
      "Yes, you can sync your data across multiple devices by logging into the same account on each device.",
  },
  {
    question: "How do I update my app?",
    answer:
      "To update your app, go to Settings and click on 'Update App'. If there is a new version available, follow the prompts to install the latest version.",
  },
  {
    question: "What should I do if I encounter a bug?",
    answer:
      "If you encounter a bug, please report it via the 'Help & Support' section. Include as many details as possible.",
  },
  {
    question: "Can I sync my data across multiple devices?",
    answer:
      "Yes, you can sync your data across multiple devices by logging into the same account on each device.",
  },
];

const HelpAndSupport = ({ setModalVisible }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Toggle FAQ visibility
  const toggleFAQ = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const contactSupport = () => {
    Linking.openURL("mailto:support@yourapp.com?subject=Help Request");
  };
  return (
      <ScrollView className="p-6 bg-white rounded-2xl shadow-lg w-full">
        {/* Title */}
        <LinearGradient
          colors={["#D6F6F5", "#B3E0DF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-lg p-4 mb-4"
        >
          <Text className="text-2xl font-bold text-teal-800 text-center">
            Help & Support
          </Text>
        </LinearGradient>

        {/* FAQ Section */}
        <View className="mb-6">
          {faqs.map((faq, index) => (
            <View key={index} className="mb-4">
              <TouchableOpacity
                onPress={() => toggleFAQ(index)}
                className="flex flex-row justify-between items-center bg-teal-50 p-4 rounded-lg shadow-md"
              >
                <Text className="text-lg font-semibold text-teal-800">
                  {faq.question}
                </Text>
                <Ionicons
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#0f766e"
                />
              </TouchableOpacity>
              {expandedIndex === index && (
                <Text className="text-teal-700 mt-2 px-2">{faq.answer}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Contact Support Section */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-teal-700 mb-4">
            Need further assistance?
          </Text>

          <TouchableOpacity
            onPress={contactSupport}
            className="bg-teal-600 py-4 rounded-full shadow-lg flex flex-row items-center justify-center"
          >
            <Ionicons name="mail-outline" size={24} color="#fff" />
            <Text className="text-center text-white font-bold text-lg ml-2">
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
        {/* Feedback Section */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-teal-700 mb-4">
            We value your feedback!
          </Text>

          <TouchableOpacity
            onPress={() => Linking.openURL("https://yourapp.com/feedback")}
            className="bg-gray-400 py-4 rounded-full shadow-lg flex flex-row items-center justify-center"
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color="#fff"
            />
            <Text className="text-center text-white font-bold text-lg ml-2">
              Submit Feedback
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}

        {/* Close Button */}
        <TouchableOpacity
          onPress={() => setModalVisible(false)}
          className="bg-gray-600 py-4 rounded-full shadow-lg flex flex-row items-center justify-center mt-4 mb-7"
        >
          <Text className="text-center text-white font-bold text-lg ml-2">
            Close
          </Text>
        </TouchableOpacity>
      </ScrollView>
  );
};

export default HelpAndSupport;
