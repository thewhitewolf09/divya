import { useState, useCallback, useEffect } from "react";
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
  Linking,
} from "react-native";
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
import { Picker } from "@react-native-picker/picker";
import {
  fetchShopList,
  fetchUser,
  logout,
  updateShopTimings,
} from "../../redux/slices/userSlice";
import { router } from "expo-router";
import { fetchCustomerDetails } from "../../redux/slices/customerSlice";

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const { user, role, shops } = useSelector((state) => state.user);
  const { customer } = useSelector((state) => state.customer);
  const [refreshing, setRefreshing] = useState(false);
  // const [selectedShop, setSelectedShop] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [shopTimings, setShopTimings] = useState({
    openingTime: user?.openingTime || "",
    closingTime: user?.closingTime || "",
  });

  // Define settings options based on user role
  const settingsOptions = [
    // { id: "2", name: "Notifications", icon: "notifications" },
    { id: "3", name: "Rate/Weight Calculator", icon: "calculator" },
    // { id: "4", name: "Help & Support", icon: "help-circle" },
  ];

  if (role === "shopOwner") {
    settingsOptions.unshift({ id: "1", name: "Shop Timings", icon: "time" });
  }

  // const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentOption, setCurrentOption] = useState(null);

  // const toggleMapSize = () => {
  //   setIsMapExpanded(!isMapExpanded);
  // };

  const fetchSettings = async () => {
    setIsLoading(true);
    if (role === "customer") {
      await dispatch(fetchShopList());
      await dispatch(fetchCustomerDetails(user?._id));
    } else {
      await dispatch(fetchShopList());
      await dispatch(fetchUser(user?._id));
    }
    setIsLoading(false);
  };

  // useEffect(() => {
  //   if (role === "customer" && shops.length === 1) {
  //     setSelectedShop(shops[0]);
  //   } else {
  //     const shop = shops.find((shop) => shop._id === user?._id);
  //     if (
  //       shop &&
  //       shop.shopLocation.googleMapLocation?.latitude &&
  //       shop.shopLocation.googleMapLocation?.longitude
  //     ) {
  //       setSelectedShop(shop);
  //     } else {
  //       setSelectedShop(null);
  //     }
  //   }
  // }, [role, shops]);

  useFocusEffect(
    useCallback(() => {
      fetchSettings();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSettings();
    setRefreshing(false);
  };

  const handleSaveTimings = (newOpeningTime, newClosingTime) => {
    dispatch(
      updateShopTimings({
        userId: user?._id,
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
    router.push("/sign-in");
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
    if (role === "shopOwner") {
      router.push("/user/edit-user");
    } else {
      router.push({
        pathname: "/customer/customer-edit",
        params: { customerId: user?._id },
      });
    }
  };

  const contactSupport = () => {
    Linking.openURL("mailto:support@yourapp.com?subject=Help Request");
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
                    {user?.name}
                  </Text>
                  <Text className="text-gray-600">{user?.mobile}</Text>

                  {/* Display shop timings and address for shopOwner */}
                  {role === "shopOwner" && (
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
                  {role === "customer" && (
                    <Text className="text-gray-600 mt-1">
                      {customer?.address?.street}, {customer?.address?.city},{" "}
                      {customer?.address?.state}, {customer?.address?.country}
                    </Text>
                  )}
                </View>
              </View>
            </LinearGradient>
          </View>


          {/* 
          {role === "customer" && shops.length > 1 && (
            <View className="mb-4">
              <Text className="text-lg font-semibold text-teal-700 mb-2">
                Select a Shop:
              </Text>
              <View className="border border-teal-600 rounded-lg bg-teal-50">
                <Picker
                  selectedValue={selectedShop?._id}
                  onValueChange={(itemValue) => {
                    const shop = shops.find((shop) => shop._id === itemValue);
                    setSelectedShop(shop);
                  }}
                  style={{ height: 50, width: "100%" }}
                >
                  {shops.map((shop) => (
                    <Picker.Item
                      key={shop._id}
                      label={shop.name}
                      value={shop._id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )} */}

          {/* Google Map for shopOwner */}
          {/* {shops && selectedShop && (
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
                  style={{
                    height: isMapExpanded ? 500 : 200,
                    marginBottom: 40,
                  }}
                  region={{
                    latitude:
                      selectedShop?.shopLocation.googleMapLocation?.latitude ||
                      0,
                    longitude:
                      selectedShop?.shopLocation.googleMapLocation?.longitude ||
                      0,
                    latitudeDelta: isMapExpanded ? 0.002 : 0.01,
                    longitudeDelta: isMapExpanded ? 0.002 : 0.01,
                  }}
                  zoomEnabled={true}
                  scrollEnabled={true}
                  showsUserLocation={true}
                  followsUserLocation={true}
                >
                  <Marker
                    coordinate={{
                      latitude:
                        selectedShop.shopLocation.googleMapLocation?.latitude,
                      longitude:
                        selectedShop.shopLocation.googleMapLocation?.longitude,
                    }}
                    title={selectedShop.name}
                    description={`${selectedShop.shopLocation?.address?.street}, ${selectedShop.shopLocation?.address?.city}, ${selectedShop.shopLocation?.address?.state}`}
                  />
                </MapView>

                {/* Address Text */}
          {/* <View className="absolute bottom-0 left-0 right-0 p-2 bg-white rounded-lg">
                  <Text className="text-center text-sm font-semibold">
                    {selectedShop.shopLocation?.address?.street},{" "}
                    {selectedShop.shopLocation?.address?.city},{" "}
                    {selectedShop.shopLocation?.address?.state}
                  </Text>
                </View>

                {/* Toggle Button */}
          {/* <TouchableOpacity
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
          )} */}



          {/* Payment History Button for Customers */}
          {role === "customer" && (
            <TouchableOpacity
              className="flex flex-row items-center p-4 bg-teal-50 rounded-lg shadow-md mb-3 border border-teal-600"
              onPress={() =>
                router.push({
                  pathname: "/sale/payment-history",
                  params: {
                    customerId: user?._id,
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

          {/* Contact Support Section */}
          <View className="mb-2">
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
          {/* {currentOption?.id === "4" && (
            <HelpSupport setModalVisible={setModalVisible} />
          )} */}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsScreen;
