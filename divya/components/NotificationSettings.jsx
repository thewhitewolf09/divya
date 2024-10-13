import { useState } from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";

const NotificationsModal = ({ setModalVisible }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <View className="p-6 bg-white rounded-2xl shadow-lg w-full">
      {/* Modal Header */}
      <LinearGradient
        colors={["#D6F6F5", "#B3E0DF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-lg p-4 mb-4"
      >
        <Text className="text-2xl font-bold text-teal-800 text-center">
          Notifications Settings
        </Text>
      </LinearGradient>

      {/* Push Notifications */}
      <View className="flex flex-row items-center justify-between mb-6">
        <Text className="text-lg font-medium text-gray-700">
          Push Notifications
        </Text>
        <Switch
          value={pushNotifications}
          onValueChange={(value) => setPushNotifications(value)}
          trackColor={{ true: "#0f766e", false: "#e5e7eb" }}
          thumbColor={pushNotifications ? "#0f766e" : "#a1a1aa"}
        />
      </View>

      {/* Email Notifications */}
      <View className="flex flex-row items-center justify-between mb-6">
        <Text className="text-lg font-medium text-gray-700">
          Email Notifications
        </Text>
        <Switch
          value={emailNotifications}
          onValueChange={(value) => setEmailNotifications(value)}
          trackColor={{ true: "#0f766e", false: "#e5e7eb" }}
          thumbColor={emailNotifications ? "#0f766e" : "#a1a1aa"}
        />
      </View>

      {/* Sound Settings */}
      <View className="flex flex-row items-center justify-between mb-6">
        <Text className="text-lg font-medium text-gray-700">Sound</Text>
        <Switch
          value={soundEnabled}
          onValueChange={(value) => setSoundEnabled(value)}
          trackColor={{ true: "#0f766e", false: "#e5e7eb" }}
          thumbColor={soundEnabled ? "#0f766e" : "#a1a1aa"}
        />
      </View>

      {/* Action Buttons */}
      <View className="flex flex-row justify-between mt-8 space-x-4">
        {/* Save Button */}
        <TouchableOpacity
          onPress={() => setModalVisible(false)} // Add your save logic here
          className="flex-1 bg-teal-600 py-4 rounded-full shadow-lg flex items-center justify-center"
        >
          <Text className="text-white font-semibold text-lg">Save</Text>
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity
          onPress={() => setModalVisible(false)}
          className="flex-1 bg-gray-500 py-4 rounded-full shadow-lg flex items-center justify-center"
        >
          <Text className="text-white font-semibold text-lg">Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NotificationsModal;
