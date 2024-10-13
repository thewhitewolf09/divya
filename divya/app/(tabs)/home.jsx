import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  View,
  Alert,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import axios from "axios";
import { images, BASE_URL } from "../../constants";
import { EmptyState, SearchInput, EventCard, Loader } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";
import { useSelector } from "react-redux";

const Home = () => {
  const { loading, user, verified } = useSelector((state) => state.user);

  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalSales: 10000,
    totalUdhar: 5000,
    attendance: { taken: 20, total: 30 },
    dailyItems: [
      { name: "Customer 1", status: true },
      { name: "Customer 2", status: false },
      { name: "Customer 3", status: true },
    ],
    udharOverview: [
      { name: "John Doe", amount: 5000, dueDate: "12 Sep" },
      { name: "Jane Smith", amount: 3500, dueDate: "15 Sep" },
    ],
    totalUdharCustomer: 5000,
    dailyItemsCustomer: [
      { name: "Milk", status: true },
      { name: "Bread", status: false },
    ],
    pendingPayments: [
      { amount: 500, dueDate: "12 Oct" },
      { amount: 300, dueDate: "15 Oct" },
    ],
  });

  const onRefresh = async () => {
    setRefreshing(true);
    //logic
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <Loader isLoading={isLoading} />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col align-middle my-3 px-4 space-y-6">
          <View className="flex justify-between items-start flex-row mb-6">
            <View>
              <Text className="font-medium text-sm text-teal-700">
                Welcome Back
              </Text>
              <Text className="text-3xl font-semibold text-teal-700">
                {user?.name || "Customer"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.replace("/notifications")}>
              <View className="mt-1.5">
                <Ionicons name="notifications" size={24} color="#0f766e" />
              </View>
            </TouchableOpacity>
          </View>

          <SearchInput
            placeholder={
              user?.role === "shopOwner"
                ? "Search a Product or Customer"
                : "Search a Product"
            }
          />

          {user?.role === "shopOwner" ? (
            <>
              {/* Key Stats */}
              <View className="bg-white border-2 border-teal-600 rounded-lg shadow-lg p-6 mb-4">
                <Text className="text-xl font-bold text-gray-800 mb-4">
                  Key Stats
                </Text>
                <View className="flex flex-col space-y-4">
                  <StatCard
                    title="Total Sales"
                    value={`₹${dashboardData.totalSales}`}
                    icon="💰"
                  />
                  <StatCard
                    title="Total Udhar"
                    value={`₹${dashboardData.totalUdhar}`}
                    icon="📊"
                  />
                  <StatCard
                    title="Attendance"
                    value={`${dashboardData.attendance.taken}/${dashboardData.attendance.total}`}
                    icon="✅"
                  />
                </View>
              </View>

              {/* Sales Performance Graph */}
              <View className="bg-white border-2 border-teal-600 rounded-lg p-4 shadow-lg mb-2">
                <Text className="text-xl font-semibold text-gray-800 mb-4">
                  Sales Performance
                </Text>
                <LineChart
                  data={{
                    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                    datasets: [
                      {
                        data: [5000, 7000, 8000, 10000],
                        color: (opacity = 1) =>
                          `rgba(72, 133, 133, ${opacity})`,
                      },
                    ],
                  }}
                  width={Dimensions.get("window").width - 60}
                  height={220}
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(72, 133, 133, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: { r: "6", strokeWidth: "2", stroke: "#000" },
                  }}
                  style={{ marginVertical: 8, borderRadius: 16 }}
                />

                <TouchableOpacity
                  onPress={() => {
                    router.replace("/sale/sales-performance");
                  }}
                  className="flex flex-row items-center justify-end w-full mt-4"
                >
                  <Text className="text-teal-700 font-bold text-lg  underline">
                    View Details
                  </Text>
                  <Ionicons name="chevron-forward" size={24} color="teal" />
                </TouchableOpacity>
              </View>

              {/* Quick Actions */}
              <View className="flex flex-row flex-wrap justify-evenly mb-2 ">
                <ActionButton
                  title="🛒 Add Sale"
                  colors={["#DEF9C4", "#9CDBA6"]}
                  onPress={() =>
                    router.replace("/sale/product-selection-for-sale")
                  }
                />
                <ActionButton
                  title="🛒 Sales History"
                  colors={["#9CDBA6", "#50B498"]}
                  onPress={() => router.replace("/sale/sales-history")}
                />
                <ActionButton
                  title="👤 Add Customer"
                  colors={["#50B498", "#468585"]}
                  onPress={() => router.replace("/customer/add-customer")}
                />
                <ActionButton
                  title="📦 Add Product"
                  colors={["#468585", "#DEF9C4"]}
                  onPress={() => router.replace("/product/add-product")}
                />
              </View>

              {/* Daily Item Tracking */}
              <View className="bg-white border-2 border-teal-600 rounded-lg p-4 shadow-lg mb-6 relative">
                <Text className="text-xl font-semibold text-gray-800 mb-4">
                  Daily Item Tracking
                </Text>

                {/* Progress Indicator */}
                <View className="bg-gray-200 h-4 rounded-full overflow-hidden mb-4">
                  <View
                    className="bg-[#50B498] h-full"
                    style={{
                      width: `${
                        (dashboardData.attendance.taken /
                          dashboardData.attendance.total) *
                        100
                      }%`,
                    }}
                  />
                </View>
                <Text className="text-gray-600 text-sm mb-2">
                  {dashboardData.attendance.taken} out of{" "}
                  {dashboardData.attendance.total} items tracked
                </Text>

                {/* Daily Items List */}
                {dashboardData.dailyItems.length > 0 ? (
                  dashboardData.dailyItems.map((item, index) => (
                    <View
                      key={index}
                      className="flex flex-row justify-between items-center py-2 border-b border-gray-300"
                    >
                      <Text className="text-gray-700">{item.name}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          alert(
                            `${item.name} is ${
                              item.status ? "completed" : "not completed"
                            }`
                          )
                        }
                      >
                        <Text
                          className={`text-lg ${
                            item.status ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {item.status ? "✅" : "❌"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-500 text-center py-4">
                    No items to track today.
                  </Text>
                )}

                {/* View Details Button in the Bottom-Right Corner */}
                <TouchableOpacity
                  onPress={() => {
                    router.replace("/track-daily-items");
                  }}
                  className="flex flex-row items-center justify-end w-full mt-4"
                >
                  <Text className="text-teal-700 font-bold text-lg  underline">
                    View Details
                  </Text>
                  <Ionicons name="chevron-forward" size={24} color="teal" />
                </TouchableOpacity>
              </View>

              {/* Udhar Overview */}
              <View className="bg-white border-2 border-teal-600 rounded-lg p-4 shadow-lg mb-6">
                <Text className="text-xl font-semibold text-gray-800 mb-4">
                  Udhar Overview
                </Text>

                {dashboardData.udharOverview.length > 0 ? (
                  dashboardData.udharOverview.map((udhar, index) => (
                    <View
                      key={index}
                      className="flex flex-row justify-between items-center py-3 border-b border-gray-200"
                    >
                      <View className="flex-1">
                        <Text className="text-gray-700 font-medium">
                          {udhar.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          Due: {udhar.dueDate}
                        </Text>
                      </View>

                      <Text className="text-gray-800 font-semibold">
                        ₹{udhar.amount}
                      </Text>

                      <TouchableOpacity
                        onPress={() => alert(`Manage Udhar for ${udhar.name}`)}
                        className="ml-4"
                      >
                        <Text className="text-teal-700 font-semibold underline">
                          Manage
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-500 text-center py-4">
                    No udhar records available.
                  </Text>
                )}

                <TouchableOpacity
                  onPress={() => {
                    router.replace("/customer-credit");
                  }}
                  className="flex flex-row items-center justify-end w-full mt-4"
                >
                  <Text className="text-teal-700 font-bold  text-lg underline">
                    View Details
                  </Text>
                  <Ionicons name="chevron-forward" size={24} color="teal" />
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          {user?.role === "customer" ? (
            <>
              {/* Quick Actions */}
              <View className="flex flex-row flex-wrap justify-evenly mb-2">
                <ActionButton
                  title="🛒 Place an Order"
                  colors={["#DEF9C4", "#9CDBA6"]}
                  onPress={() => router.replace("/order/place-order")}
                />
                <ActionButton
                  title="📦 Track Orders"
                  colors={["#9CDBA6", "#50B498"]}
                  onPress={() => router.replace("/order/track-orders")}
                />
              </View>

              {/* Pending Payments Overview */}
              <View className="bg-white border-2 border-teal-600 rounded-lg shadow-lg p-6 mb-4">
                <Text className="text-xl font-bold text-gray-800 mb-4">
                  Pending Payments
                </Text>
                {dashboardData.pendingPayments.length > 0 ? (
                  dashboardData.pendingPayments.map((payment, index) => (
                    <View
                      key={index}
                      className="flex flex-row justify-between items-center py-3 border-b border-gray-200"
                    >
                      <View className="flex-1">
                        <Text className="text-gray-700">
                          Amount: ₹{payment.amount}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          Due: {payment.dueDate}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => alert(`Pay ₹${payment.amount} now`)}
                        className="ml-4"
                      >
                        <Text className="text-teal-700 font-semibold underline">
                          Pay Now
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-500 text-center py-4">
                    No pending payments.
                  </Text>
                )}
              </View>

              {/* Daily Item Tracking */}
              <View className="bg-white border-2 border-teal-600 rounded-lg p-4 shadow-lg mb-6">
                <Text className="text-xl font-semibold text-gray-800 mb-4">
                  Daily Item Tracking
                </Text>
                {dashboardData.dailyItemsCustomer.length > 0 ? (
                  dashboardData.dailyItemsCustomer.map((item, index) => (
                    <View
                      key={index}
                      className="flex flex-row justify-between items-center py-2 border-b border-gray-300"
                    >
                      <Text className="text-gray-700">{item.name}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          alert(
                            `${item.name} is ${
                              item.status ? "delivered" : "pending"
                            }`
                          )
                        }
                      >
                        <Text
                          className={`text-lg ${
                            item.status ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {item.status ? "✅" : "❌"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-500 text-center py-4">
                    No items to track today.
                  </Text>
                )}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ title, value, icon }) => (
  <LinearGradient
    colors={["#9CDBA6", "#50B498"]}
    className="rounded-lg p-4 shadow-lg mb-1"
    style={{ elevation: 5 }}
  >
    <View className="flex flex-row items-center justify-between">
      <Text className="text-3xl">{icon}</Text>
      <View className="flex-1 ml-4">
        <Text className="text-gray-700 text-lg font-semibold">{title}</Text>
        <Text className="text-gray-800 text-2xl font-bold">{value}</Text>
      </View>
    </View>
  </LinearGradient>
);

const ActionButton = ({ title, colors, onPress }) => (
  <LinearGradient
    colors={colors}
    className="rounded-lg p-4 my-1 mx-1 w-5/12"
    style={{ elevation: 2 }}
  >
    <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
      <Text className="text-white text-center font-bold">{title}</Text>
    </TouchableOpacity>
  </LinearGradient>
);

export default Home;
