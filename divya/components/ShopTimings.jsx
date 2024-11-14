import { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

const ShopTimings = ({ user, onSave, setModalVisible }) => {
  const [openingTime, setOpeningTime] = useState(new Date());
  const [closingTime, setClosingTime] = useState(new Date());
  const [showOpeningPicker, setShowOpeningPicker] = useState(false);
  const [showClosingPicker, setShowClosingPicker] = useState(false);

  const handleOpeningTimeChange = (event, selectedDate) => {
    const currentTime = selectedDate || openingTime;
    setShowOpeningPicker(Platform.OS === "ios");
    setOpeningTime(currentTime);
  };

  const handleClosingTimeChange = (event, selectedDate) => {
    const currentTime = selectedDate || closingTime;
    setShowClosingPicker(Platform.OS === "ios");
    setClosingTime(currentTime);
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View className="p-6 bg-white rounded-2xl shadow-lg w-full">
      {/* Title */}
      <LinearGradient
        colors={["#D6F6F5", "#B3E0DF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-lg p-4 mb-4"
      >
        <Text className="text-2xl font-bold text-teal-800 text-center">
          Shop Timings
        </Text>
      </LinearGradient>

      {/* Opening Time */}
      <View className="mb-6">
        <Text className="text-lg font-medium text-gray-700 mb-2">
          Opening Time
        </Text>
        <TouchableOpacity
          onPress={() => setShowOpeningPicker(true)}
          className="flex flex-row items-center justify-between bg-teal-50 p-4 rounded-lg shadow-md"
        >
          <Text className="text-teal-800 text-lg">
            {formatTime(openingTime)}
          </Text>
          <Ionicons name="time-outline" size={24} color="#0f766e" />
        </TouchableOpacity>
      </View>

      {showOpeningPicker && (
        <DateTimePicker
          value={openingTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleOpeningTimeChange}
        />
      )}

      {/* Closing Time */}
      <View className="mb-6">
        <Text className="text-lg font-medium text-gray-700 mb-2">
          Closing Time
        </Text>
        <TouchableOpacity
          onPress={() => setShowClosingPicker(true)}
          className="flex flex-row items-center justify-between bg-teal-50 p-4 rounded-lg shadow-md"
        >
          <Text className="text-teal-800 text-lg">
            {formatTime(closingTime)}
          </Text>
          <Ionicons name="time-outline" size={24} color="#0f766e" />
        </TouchableOpacity>
      </View>

      {showClosingPicker && (
        <DateTimePicker
          value={closingTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleClosingTimeChange}
        />
      )}

      {/* Action Buttons */}
      <View className="flex flex-row justify-between mt-8 space-x-4">
        {/* Save Button */}
        <TouchableOpacity
          onPress={() =>
            onSave(formatTime(openingTime), formatTime(closingTime))
          }
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

export default ShopTimings;
