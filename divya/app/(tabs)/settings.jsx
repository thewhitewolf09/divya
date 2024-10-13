import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Text,
  View,
  Alert,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useGlobalContext } from "../../context/GlobalProvider";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Loader } from "../../components";
import ShopTimings from "../../components/ShopTimings";
import NotificationsModal from "../../components/NotificationSettings";
import RateWeightCalculator from "../../components/RateWeightCalculator";
import HelpSupport from "../../components/HelpSupport";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/userSlice";
import { router } from "expo-router";

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const { userToken } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Demo user data
  const userData = {
    mobile: "+919876543210",
    name: "Rahul Sharma",
    isVerified: true,
    shopLocation: {
      address: {
        street: "456 MG Road",
        city: "Bangalore",
        state: "Karnataka",
        postalCode: "560001",
        country: "India",
      },
      googleMapLocation: {
        latitude: 12.9716,
        longitude: 77.5946,
      },
    },
    openingTime: "10:00 AM",
    closingTime: "9:00 PM",
  };
  const [shopTimings, setShopTimings] = useState({
    openingTime: userData.openingTime,
    closingTime: userData.closingTime,
  });

  const settingsOptions = [
    { id: "1", name: "Shop Timings", icon: "time" },
    { id: "2", name: "Notifications", icon: "notifications" },
    { id: "3", name: "Rate/Weight Calculator", icon: "calculator" },
    { id: "4", name: "Help & Support", icon: "help-circle" },
  ];

  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentOption, setCurrentOption] = useState(null);

  const toggleMapSize = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  const updateTimings = (newTimings) => {
    setShopTimings(newTimings);
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    // Fetch your settings from the API if needed
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchSettings();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSettings().finally(() => setRefreshing(false));
  };

  const handleSaveTimings = (newOpeningTime, newClosingTime) => {
    setShopTimings({
      openingTime: newOpeningTime,
      closingTime: newClosingTime,
    });
    setModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "You have been logged out.");

    dispatch(logout());
    router.replace("/sign-in");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="flex flex-row items-center p-4 bg-teal-50 rounded-lg shadow-md mb-3 border border-teal-600"
      onPress={() => {
        setCurrentOption(item);
        setModalVisible(true);
      }}
    >
      <Ionicons name={item.icon} size={30} color="#0f766e" />
      <Text className="ml-4 text-lg font-semibold text-gray-800">
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="bg-white h-full">
      <Loader isLoading={isLoading} />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col my-3 px-4 space-y-6">
          {/* Header */}
          <View className="flex justify-between items-start flex-row mb-6">
            <Text className="text-2xl font-semibold text-teal-700">
              Settings
            </Text>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={28} color="#0f766e" />
            </TouchableOpacity>
          </View>

          {/* User Info Section */}
          <View className="rounded-lg shadow-lg mb-4">
            <LinearGradient
              colors={["#D6F6F5", "#B3E0DF"]}
              className="p-6 rounded-lg"
            >
              <View className="flex flex-row items-center">
                <Ionicons name="person-circle" size={60} color="#0f766e" />
                <View className="ml-4 flex-1">
                  <Text className="text-xl font-semibold text-gray-800">
                    {userData.name}
                  </Text>
                  <Text className="text-gray-600">{userData.mobile}</Text>
                  <Text className="text-gray-800 font-bold mt-1">
                    {userData.openingTime} - {userData.closingTime}
                  </Text>
                  <Text className="text-gray-600 mt-1">
                    {userData.shopLocation.address.street},{" "}
                    {` ${userData.shopLocation.address.city},`}{" "}
                    {` ${userData.shopLocation.address.state},`}{" "}
                    {` ${userData.shopLocation.address.country}`}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Google Map */}
          <View className={`mb-4 rounded-lg shadow-lg`}>
            <View
              style={{
                borderColor: "#0f766e",
                borderWidth: 1,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <MapView
                style={{ height: isMapExpanded ? "100%" : 200 }}
                initialRegion={{
                  latitude: userData.shopLocation.googleMapLocation.latitude,
                  longitude: userData.shopLocation.googleMapLocation.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: userData.shopLocation.googleMapLocation.latitude,
                    longitude:
                      userData.shopLocation.googleMapLocation.longitude,
                  }}
                  title={userData.name}
                  description={`${userData.shopLocation.address.street}, ${userData.shopLocation.address.city}, ${userData.shopLocation.address.state}`}
                />
              </MapView>

              {/* Address Text */}
              <View className="absolute bottom-0 left-0 right-0 p-2 bg-white rounded-lg">
                <Text className="text-center text-sm font-semibold">
                  {userData.shopLocation.address.street},{" "}
                  {userData.shopLocation.address.city},{" "}
                  {userData.shopLocation.address.state}
                </Text>
              </View>

              {/* Toggle Button */}
              <TouchableOpacity
                onPress={toggleMapSize}
                className="absolute right-2 top-2 bg-white p-2 rounded-full shadow-md"
              >
                <Ionicons
                  name={isMapExpanded ? "contract" : "expand"}
                  size={24}
                  color="#0f766e"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Options List */}
          <FlatList
            data={settingsOptions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        </View>
      </ScrollView>

      {/* Modal for settings options */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-white ">
          {currentOption?.id === "1" && (
            <ShopTimings
              userData={{
                openingTime: shopTimings.openingTime,
                closingTime: shopTimings.closingTime,
              }}
              onSave={updateTimings}
              setModalVisible={setModalVisible}
            />
          )}
          {currentOption?.id === "2" && (
            <NotificationsModal setModalVisible={setModalVisible} />
          )}
          {currentOption?.id === "3" && (
            <RateWeightCalculator setModalVisible={setModalVisible} />
          )}
          {currentOption?.id === "4" && (
            <HelpSupport setModalVisible={setModalVisible} />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsScreen;
