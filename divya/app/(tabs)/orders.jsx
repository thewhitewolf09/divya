import { useState, useRef, useMemo, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SearchInput } from "../../components";
import { useSelector, useDispatch } from "react-redux";
import { getAllOrders } from "../../redux/slices/orderSlice";
import BottomSheet from "@gorhom/bottom-sheet";
import { router, useFocusEffect } from "expo-router";

const OrderManagementScreen = () => {
  const dispatch = useDispatch();

  const { orders, loading } = useSelector((state) => state.order);


  const [refreshing, setRefreshing] = useState(false);
  const filterSheetRef = useRef(null);
  const sortSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);
  const [activeSheet, setActiveSheet] = useState(null);

  const handleOpenFilter = () => {
    setActiveSheet("filter");
    filterSheetRef.current?.expand();
    sortSheetRef.current?.close();
  };

  const handleOpenSort = () => {
    setActiveSheet("sort");
    sortSheetRef.current?.expand();
    filterSheetRef.current?.close();
  };

  const fetchOrders = async () => {
    await dispatch(getAllOrders());
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleCloseSheet = () => {
    setActiveSheet(null);
  };

  // Sort orders by date (descending order)
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const renderOrderItem = ({ item }) => (
    <View className="border border-gray-200 py-4 m-2 w-[96%] rounded-xl shadow-md bg-white">
      <View className="flex-row justify-between items-center px-5">
        <Text className="text-gray-800 text-lg font-semibold">
          {item.customerId.name}
        </Text>
        <Ionicons name="file-tray-full" size={28} color="#0f766e" />
      </View>

      <View className="flex-row justify-between px-5 mt-3">
        <Text className="text-gray-500">
          Order Date: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <View
          className={`px-3 py-1 rounded-full ${
            item.status === "Delivered" ? "bg-green-50" : "bg-yellow-50"
          }`}
        >
          <Text
            className={`font-medium text-sm ${
              item.status === "Delivered" ? "text-green-700" : "text-yellow-700"
            }`}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className="bg-teal-700 rounded-lg py-2 mt-4 mx-5 shadow-sm"
        onPress={() => {
          router.push({
            pathname: "/order/order-details-admin",
            params: { orderId: item._id },
          });
        }}
      >
        <Text className="text-white text-center text-sm font-medium">
          View Details
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col align-middle my-3 px-4 space-y-6">
          {/* Header */}
          <View className="flex justify-between items-start flex-row mb-6">
            <View>
              <Text className="text-2xl font-semibold text-teal-700">
                Orders
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.replace("/notifications")}>
              <View className="mt-1.5">
                <Ionicons name="notifications" size={24} color="#0f766e" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <SearchInput />

          <View className="flex flex-row justify-between items-center my-4 ">
            {/* Products Count */}
            <Text className="text-gray-800 font-semibold text-lg">
              {orders.length} Orders
            </Text>

            {/* Filter & Sort Buttons */}
            <View className="flex flex-row space-x-3">
              {/* Filter Button */}
              <TouchableOpacity
                className="flex flex-row items-center border border-teal-600 rounded-lg py-2 px-3"
                onPress={handleOpenFilter}
              >
                <Ionicons name="filter" size={18} color="#50B498" />
                <Text className="ml-1 text-teal-600 font-semibold">Filter</Text>
              </TouchableOpacity>

              {/* Sort Button */}
              <TouchableOpacity
                className="flex flex-row items-center border border-teal-600 rounded-lg py-2 px-3"
                onPress={handleOpenSort}
              >
                <Ionicons name="swap-vertical" size={18} color="#50B498" />
                <Text className="ml-1 text-teal-600 font-semibold">Sort</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Orders List*/}
          <FlatList
            data={sortedOrders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrderItem}
            ListEmptyComponent={
              <Text className="text-center mt-10 text-gray-600">
                No orders available.
              </Text>
            }
          />
        </View>
      </ScrollView>

      <BottomSheet
        ref={filterSheetRef}
        index={activeSheet === "filter" ? 0 : -1}
        snapPoints={snapPoints}
        onClose={handleCloseSheet}
        enablePanDownToClose
      >
        <View className="p-4">
          <Text className="text-lg font-bold text-teal-700 mb-4">
            Filter By
          </Text>
          {/* Add Filter Options Here */}
        </View>
      </BottomSheet>

      <BottomSheet
        ref={sortSheetRef}
        index={activeSheet === "sort" ? 0 : -1}
        snapPoints={snapPoints}
        onClose={handleCloseSheet}
        enablePanDownToClose
      >
        <View className="p-4">
          <Text className="text-lg font-bold text-teal-700 mb-4">Sort By</Text>
          {/* Add Sort Options Here */}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default OrderManagementScreen;
