import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, FlatList, Image, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect, router } from "expo-router";
import { images } from "../constants";

// Sample notifications with `isRead` property, and some without images
const initialNotifications = [
  {
    id: 1,
    title: "Rate Change Alert",
    description: "The price of Organic Avocados has dropped by 10%.",
    date: "Oct 01, 2024",
    image: images.demoproduct,  // Image included
    isRead: false,
  },
  {
    id: 2,
    title: "New Product: Fresh Strawberries",
    description: "Fresh Strawberries are now available at ₹300 per kg.",
    date: "Sep 30, 2024",
    image: null,  // No image
    isRead: true,
  },
  {
    id: 3,
    title: "Promotion Alert",
    description: "Special discount on all berries this weekend!",
    date: "Oct 02, 2024",
    image: null,  // No image
    isRead: false,
  },
  // Add more notifications here
];

const NotificationScreen = () => {
  // State to manage notifications
  const [notifications, setNotifications] = useState(initialNotifications);

  // Function to mark a notification as read
  const markAsRead = (id) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, isRead: true } : notification
    );
    setNotifications(updatedNotifications);
  };

  return (
    <SafeAreaView className="h-full">
      <View className="flex-row items-center px-4 py-3">
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
          <Ionicons name="chevron-back" size={28} color="teal" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold text-teal-700">Notifications</Text>
      </View>

      <ScrollView className="px-4">
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => markAsRead(item.id)}
              className="flex flex-row items-center py-4 border-b border-gray-300"
            >
              {/* Conditional Rendering for Image */}
              {item.image ? (
                <Image source={item.image} className="w-16 h-16 rounded-lg mr-4" resizeMode="contain" />
              ) : (
                <View className="w-16 h-16 rounded-lg mr-4 bg-gray-200 flex items-center justify-center">
                  <Ionicons name="notifications-outline" size={28} color="gray" />
                </View>
              )}

              {/* Notification Details */}
              <View className="flex-1">
                <Text className={`text-lg font-bold ${item.isRead ? "text-gray-600" : "text-teal-700"}`}>
                  {item.title}
                </Text>
                <Text className="text-gray-600">{item.description}</Text>
                <Text className="text-gray-500 text-sm">{item.date}</Text>
              </View>

              {/* Read/Unread Indicator */}
              {!item.isRead && (
                <View className="w-3 h-3 rounded-full border border-teal-700 mr-4" />
              )}
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationScreen;
