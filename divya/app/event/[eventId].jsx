import { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../../constants";
import { useLocalSearchParams, router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import { images } from "../../constants";
import { CustomButton } from "../../components";
import { useFocusEffect } from "@react-navigation/native";

const EventScreen = () => {
  const { userToken, userInfo } = useGlobalContext();
  const { eventId } = useLocalSearchParams();
  const [event, setEvent] = useState(null);
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      const eventData = response.data.event;
      setEvent(eventData);

      if (eventData.createdBy) {
        const userResponse = await axios.get(
          `${BASE_URL}/users/get-user/${eventData.createdBy}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        if (userResponse.data.user) {
          setUserName(userResponse.data.user.name);
        } else {
          setUserName("Unknown User"); // Fallback in case user is null
        }
      }

      const registered = eventData.registeredAttendees.includes(userInfo._id);
      setIsRegistered(registered);
    } catch (error) {
      Alert.alert("Error", `${error}`);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvent();
    }, [eventId, userToken, userInfo._id])
  );

  const handleRegister = async () => {
    try {
      await axios.post(
        `${BASE_URL}/events/${eventId}/register`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      setIsRegistered(true);
      Alert.alert("Success", "You have successfully registered for the event");
    } catch (error) {
      const errorMessage =
        error.response?.data?.resultMessage || "Registration failed";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleUnregister = async () => {
    try {
      await axios.post(
        `${BASE_URL}/events/${eventId}/unregister`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      setIsRegistered(false);
      Alert.alert(
        "Success",
        "You have successfully unregistered from the event"
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.resultMessage || "Unregistration failed";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleEdit = () => {
    router.push(`/edit/${eventId}`);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      Alert.alert("Deleted", "The event has been successfully deleted");
      router.replace("/home");
    } catch (error) {
      const errorMessage =
        error.response?.data?.resultMessage || "Failed to delete event";
      Alert.alert("Error", errorMessage);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 p-4 bg-primary">
        <Text className="text-white text-center">No event found</Text>
      </View>
    );
  }

  const isEventOwner = event.createdBy === userInfo?._id;

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.concertImage}
        className="w-full h-40 mb-4"
        resizeMode="cover"
      />

      <View className="flex-1 p-4">
        <TouchableOpacity
          onPress={() => router.replace("/")}
          className="flex w-full items-end mb-4"
        ></TouchableOpacity>

        <Text className="text-2xl font-psemibold text-white mb-4">
          {event.title}
        </Text>
        <Text className="text-lg text-gray-100 mb-1">
          Location: {event.eventLocation}
        </Text>
        <Text className="text-lg text-gray-100 mb-1">
          Date: {event.eventDate}
        </Text>
        <Text className="text-lg text-gray-100 mb-1">
          Registration Fee: {event.registrationFee}
        </Text>
        <Text className="text-lg text-gray-100 mb-1">
          Description: {event.description}
        </Text>
        <Text className="text-lg text-gray-100 mb-1">
          Created By: {userName}
        </Text>
      </View>

      <View className="p-4">
        {isEventOwner ? (
          <>
            <CustomButton
              title="Edit Event"
              handlePress={handleEdit}
              containerStyles="mb-2 w-full"
            />
            <CustomButton
              title="Delete Event"
              handlePress={handleDelete}
              containerStyles="w-full"
            />
          </>
        ) : isRegistered ? (
          <CustomButton
            title="Unregister"
            handlePress={handleUnregister}
            containerStyles="w-full"
          />
        ) : (
          <CustomButton
            title="Register"
            handlePress={handleRegister}
            containerStyles="w-full"
          />
        )}
      </View>
    </View>
  );
};

export default EventScreen;
