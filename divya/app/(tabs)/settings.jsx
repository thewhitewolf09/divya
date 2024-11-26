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
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { Loader } from "../../components";
import ShopTimings from "../../components/ShopTimings";
import NotificationsModal from "../../components/NotificationSettings";
import RateWeightCalculator from "../../components/RateWeightCalculator";
import HelpSupport from "../../components/HelpSupport";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUser,
  logout,
  updateShopTimings,
} from "../../redux/slices/userSlice";
import { router } from "expo-router";
import { fetchCustomerDetails } from "../../redux/slices/customerSlice";

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [shopTimings, setShopTimings] = useState({
    openingTime: user?.openingTime || "",
    closingTime: user?.closingTime || "",
  });

  // Define settings options based on user role
  const settingsOptions = [
    { id: "2", name: "Notifications", icon: "notifications" },
    { id: "3", name: "Rate/Weight Calculator", icon: "calculator" },
    { id: "4", name: "Help & Support", icon: "help-circle" },
  ];

  // If the user is a shop owner, add "Shop Timings" option
  if (user?.role === "shopOwner") {
    settingsOptions.unshift({ id: "1", name: "Shop Timings", icon: "time" });
  }

  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentOption, setCurrentOption] = useState(null);

  const toggleMapSize = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    if (user.role === "customer") {
      await dispatch(fetchCustomerDetails(user._id));
    } else {
      await dispatch(fetchUser(user._id));
    }
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
    dispatch(
      updateShopTimings({
        userId: user._id,
        shopTimings: {
          openingTime: newOpeningTime,
          closingTime: newClosingTime,
        },
      })
    )
      .unwrap()
      .then((updatedUser) => {
        setShopTimings({
          openingTime: newOpeningTime,
          closingTime: newClosingTime,
        });
        setModalVisible(false);

        // Alert for successful update
        Alert.alert("Success", "Shop timings updated successfully!");
      })
      .catch((error) => {
        // Alert for error
        Alert.alert("Error", error);
      });
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

  const handleEditProfile = () => {
    console.log("edit");
  };

  return (
    <SafeAreaView className="bg-white h-full">
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
          <View className="rounded-lg shadow-lg mb-4 relative">
            <LinearGradient
              colors={["#D6F6F5", "#B3E0DF"]}
              className="p-6 rounded-lg"
            >
              {/* Edit Profile Icon */}
              <TouchableOpacity
                onPress={handleEditProfile} // Define this function to navigate to the edit profile screen
                className="absolute top-4 right-4"
              >
                <FontAwesome name="edit" size={28} color="#0f766e" />
              </TouchableOpacity>

              <View className="flex flex-row items-center">
                <Ionicons name="person-circle" size={60} color="#0f766e" />
                <View className="ml-4 flex-1">
                  <Text className="text-xl font-semibold text-gray-800">
                    {user.name}
                  </Text>
                  <Text className="text-gray-600">{user.mobile}</Text>

                  {/* Display shop timings and address for shopOwner */}
                  {user?.role === "shopOwner" && (
                    <>
                      <Text className="text-gray-800 font-bold mt-1">
                        {shopTimings.openingTime} - {shopTimings.closingTime}
                      </Text>
                      <Text className="text-gray-600 mt-1">
                        {user?.shopLocation?.address?.street},{" "}
                        {user?.shopLocation?.address?.city},{" "}
                        {user?.shopLocation?.address?.state},{" "}
                        {user?.shopLocation?.address?.country}
                      </Text>
                    </>
                  )}

                  {/* Display address for customer */}
                  {user?.role === "customer" && (
                    <Text className="text-gray-600 mt-1">
                      {user?.address?.street}, {user?.address?.city},{" "}
                      {user?.address?.state}, {user?.address?.country}
                    </Text>
                  )}
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Google Map for shopOwner */}
          {user?.role === "shopOwner" && user?.shopLocation && (
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
                    latitude: user.shopLocation.googleMapLocation.latitude,
                    longitude: user.shopLocation.googleMapLocation.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: user.shopLocation.googleMapLocation.latitude,
                      longitude: user.shopLocation.googleMapLocation.longitude,
                    }}
                    title={user.name}
                    description={`${user.shopLocation.address.street}, ${user.shopLocation.address.city}, ${user.shopLocation.address.state}`}
                  />
                </MapView>

                {/* Address Text */}
                <View className="absolute bottom-0 left-0 right-0 p-2 bg-white rounded-lg">
                  <Text className="text-center text-sm font-semibold">
                    {user.shopLocation.address.street},{" "}
                    {user.shopLocation.address.city},{" "}
                    {user.shopLocation.address.state}
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
          )}

          {/* Payment History Button for Customers */}
          {user?.role === "customer" && (
            <TouchableOpacity
              className="flex flex-row items-center p-4 bg-teal-50 rounded-lg shadow-md mb-3 border border-teal-600"
              onPress={() =>
                router.push({
                  pathname: "/sale/payment-history",
                  params: {
                    customerId: user._id,
                  },
                })
              }
            >
              <Ionicons name="wallet-outline" size={30} color="#0f766e" />
              <Text className="ml-4 text-lg font-semibold text-gray-800">
                Payment History
              </Text>
            </TouchableOpacity>
          )}

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
              user={{
                openingTime: shopTimings.openingTime,
                closingTime: shopTimings.closingTime,
              }}
              onSave={handleSaveTimings}
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
