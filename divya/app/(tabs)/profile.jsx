import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  Text,
} from "react-native";
import { images, BASE_URL } from "../../constants";
import axios from "axios";
import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { EmptyState, InfoBox, EventCard, Loader } from "../../components";

const Profile = () => {
  const { userToken, userInfo, logout, delAcc } = useGlobalContext();
  const [createdEvents, setCreatedEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCreatedEvents = useCallback(async () => {
    try {
      const eventsResponse = await axios.get(
        `${BASE_URL}/users/created-events`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      setCreatedEvents(eventsResponse.data.events);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch created user events");
    }
  }, [userToken]);

  const fetchRegisteredEvents = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users/registered-events`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setRegisteredEvents(response.data.events);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch registered events");
    }
  }, [userToken]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchCreatedEvents();
      fetchRegisteredEvents();
      setIsLoading(false);
    }, [])
  );

  const signout = async () => {
    try {
      await logout();
      Alert.alert("See You Soon", "User logged out successfully");
      router.replace("/sign-in");
    } catch (error) {
      Alert.alert("Error", "Failed to log out");
    }
  };
  const deleteAcc = async () => {
    try {
      await axios.delete(`${BASE_URL}/users/delete-user`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      await delAcc();
      Alert.alert("Bye", "User deleted successfully");
      router.replace("/sign-in");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <Loader isLoading={isLoading} />
      <FlatList
        data={createdEvents}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <EventCard
            title={item.title}
            location={item.eventLocation}
            eventId={item._id}
          />
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Events Found"
            subtitle="No Events created by you"
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <View className="w-full flex justify-center items-center mb-5 px-4">
              <View className="w-full flex flex-row justify-between">
                <TouchableOpacity onPress={deleteAcc} className="mb-10">
                  <Image
                    source={icons.deleteAccount}
                    resizeMode="contain"
                    className="w-6 h-6"
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={signout} className="mb-10">
                  <Image
                    source={icons.logout}
                    resizeMode="contain"
                    className="w-6 h-6"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {userInfo ? (
              <>
                <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
                  <Image
                    source={images.avatar}
                    className="w-[90%] h-[90%] rounded-lg"
                    resizeMode="cover"
                  />
                </View>

                <InfoBox
                  title={userInfo.name}
                  containerStyles="mt-5"
                  titleStyles="text-lg"
                />

                <View className="mt-5 flex flex-row">
                  <InfoBox
                    title={createdEvents.length || "0"}
                    subtitle="Events Created"
                    titleStyles="text-xl"
                    containerStyles="mr-10"
                  />
                  <InfoBox
                    title={registeredEvents.length || "0"}
                    subtitle="Events Registered"
                    titleStyles="text-xl"
                  />
                </View>
              </>
            ) : (
              <Text className="text-white">No user Info found</Text>
            )}
            <View className="w-full flex-1 pt-10 ">
              <Text className="text-lg font-pregular text-gray-100">
                Created Events
              </Text>
            </View>
          </View>
        )}
        refreshing={isLoading}
        onRefresh={() => {
          fetchRegisteredEvents();
          fetchCreatedEvents()
          return
        }}
      />
    </SafeAreaView>
  );
};

export default Profile;
