import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect, router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markReadNotification,
  deleteNotification,
  clearNotificationError,
} from "../redux/slices/notificationSlice";

// Helper function to format the date
const formatDate = (date) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleDateString(undefined, options);
};

const NotificationScreen = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error } = useSelector(
    (state) => state.notification
  );
  const { user } = useSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotificationsHandler = async () => {
    await dispatch(fetchNotifications({ role: user.role, id: user._id }));
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotificationsHandler();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotificationsHandler();
    setRefreshing(false);
  };

  const handleMarkAsRead = (id) => {
    dispatch(markReadNotification(id));
  };

  const confirmDeleteNotification = (id) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => dispatch(deleteNotification(id)),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
          <Text className="text-2xl font-semibold text-teal-700">
            Notifications
          </Text>
        </View>

        {error && (
          <View className="p-4 bg-red-100 border border-red-500 rounded-lg mx-4">
            <Text className="text-red-700 font-semibold">{error}</Text>
            <TouchableOpacity
              onPress={() => dispatch(clearNotificationError())}
            >
              <Text className="text-teal-700 mt-2">Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {notifications.length > 0 ? (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleMarkAsRead(item._id)}
                className="flex flex-row items-center py-4 px-4 border-b border-gray-300"
                style={{
                  backgroundColor: item.isRead ? "#ffffff" : "#eaf8f2",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                {/* Image */}
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    className="w-12 h-12 rounded-md mr-3"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center mr-3">
                    <Ionicons
                      name="notifications-outline"
                      size={24}
                      color="gray"
                    />
                  </View>
                )}

                {/* Notification Details */}
                <View className="flex-1">
                  <View className="flex flex-row items-center">
                    <Text
                      className={`text-base font-semibold ${
                        item.isRead ? "text-gray-700" : "text-teal-700"
                      }`}
                      style={{ flex: 1 }}
                    >
                      {item.title}
                    </Text>
                    {!item.isRead && (
                      <View className="w-3 h-3 bg-teal-700 rounded-full ml-2" />
                    )}
                  </View>
                  <Text className="text-gray-600 text-sm mt-1">
                    {item.message}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-2">
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                {/* Delete Button */}
                <TouchableOpacity
                  onPress={() => confirmDeleteNotification(item._id)}
                  className="ml-4"
                >
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 text-lg">
              No notifications available
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationScreen;
