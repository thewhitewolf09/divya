import { useState, useCallback, useRef, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import { useDispatch, useSelector } from "react-redux";
import { getCustomerSales } from "../../redux/slices/saleSlice";
import { ScrollView } from "react-native-gesture-handler";
import { generateReciept } from "../../components/generateReciept";

const PaymentHistory = () => {
  const { customerId } = useLocalSearchParams();
  const dispatch = useDispatch();
  const { sales, isLoading, error } = useSelector((state) => state.sale);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null);

  // Bottom sheet references
  const filterSheetRef = useRef(null);
  const sortSheetRef = useRef(null);

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const fetchTransactions = async () => {
    try {
      await dispatch(getCustomerSales(customerId)).unwrap();
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleCloseSheet = () => {
    setActiveSheet(null);
  };

  // Payment Filters and Sort Options
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

  const renderTransactionItem = ({ item }) => {
    const totalAmount = item.quantity * item.price;

    const handleViewReceipt = async () => {
      const receiptData = {
        date: new Date(item.date),
        productDetails: [
          {
            name: item.productId?.name || "Product 1", 
            quantity: item.quantity, 
            price: item.productId?.price, 
            discount: item.productId?.discount || 0,  
            tax: item.tax || 0,  
          },
        ],
        customer: {
          name: item.customerId?.name || "Customer Name", 
          mobile: item.customerId?.mobile || "9876543210",
          address: {
            street: item.customerId?.address?.street || "123 Main St",
            city: item.customerId?.address?.city || "Mumbai",
            state: item.customerId?.address?.state || "Maharashtra",
            postalCode: item.customerId?.address?.postalCode || "400001",
            country: item.customerId?.address?.country || "India",
          },
        },
        shopOwner: {
          name: item.productId?.addedBy?.name || "Shop Owner",  
          shopLocation: {
            address: {
              street: item.productId?.addedBy?.shopLocation.address?.street || "456 Shop St",
              city: item.productId?.addedBy?.shopLocation.address?.city || "Mumbai",
              state: item.productId?.addedBy?.shopLocation.address?.state || "Maharashtra",
              postalCode: item.productId?.addedBy?.shopLocation.address?.postalCode || "400002", 
              country: item.productId?.addedBy?.shopLocation.address?.country || "India",
            },
          },
        },
        saleType: item.saleType || "membership",  
        totalAmount: item.quantity * item.price,
        paymentMethod: item.isCredit ? "Credit" : "Normal", 
        paymentStatus: item.creditDetails?.paymentStatus || "Pending", 
        amountOwed: item.creditDetails?.amountOwed || 0,
      };
    
      // Generate the receipt PDF dynamically
      await generateReciept(receiptData);
    };
    

    return (
      <View className="bg-white border border-gray-300 shadow-lg rounded-lg m-2 p-4">
        {/* Transaction Top Section */}
        <View className="flex flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-2xl font-bold text-teal-700">
              ₹{totalAmount.toFixed(2)}
            </Text>
            <Text className="text-sm text-gray-500">
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          <Ionicons name="receipt-outline" size={32} color="#50B498" />
        </View>

        {/* Payment Method, Status, and Product Info */}
        <View className="flex flex-row justify-between items-center mb-2">
          <Text className="text-lg font-medium text-gray-700">
            {item.productId?.name || "Product"} ({item.quantity}x)
          </Text>
          <Text className="text-sm text-gray-600">Type: {item.saleType}</Text>
        </View>

        {/* Payment Status */}
        <View className="flex flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-600">
            Method: {item.isCredit ? "Credit" : "Normal"}
          </Text>
          <Text
            className={`text-sm font-semibold ${
              item.creditDetails?.paymentStatus === "paid"
                ? "text-green-600"
                : item.creditDetails?.paymentStatus === "partially_paid"
                ? "text-orange-600"
                : "text-red-600"
            }`}
          >
            {item.creditDetails?.paymentStatus || "N/A"}
          </Text>
        </View>

        {/* Credit Amount if applicable */}
        {item.isCredit && (
          <View className="flex flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-600">
              Owed: ₹{item.creditDetails.amountOwed.toFixed(2)}
            </Text>
          </View>
        )}

        {/* View or Download Receipt */}
        <TouchableOpacity
          className="bg-teal-600 rounded-lg py-2 px-4 mt-2"
          onPress={handleViewReceipt} // Handle viewing the receipt dynamically
        >
          <Text className="text-white font-semibold text-center text-sm">
            View Receipt
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Create a sorted array of sales
  const sortedSales = useMemo(() => {
    return (sales || [])
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [sales]);

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col my-3 px-4 space-y-6">
          <View className="flex-row items-center mb-6 mt-2">
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
              Payment History
            </Text>
          </View>

          <View className="flex flex-row justify-between items-center my-4 ">
            {/* Products Count */}
            <Text className="text-gray-800 font-semibold text-lg">
              {sales.length} Payments
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

          <FlatList
            data={sortedSales} // Use the sorted sales data
            keyExtractor={(item) => item._id}
            renderItem={renderTransactionItem}
            ListEmptyComponent={() => (
              <View className="flex items-center justify-center mt-10">
                <Text className="text-gray-600 text-lg">
                  No transactions available.
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        ref={filterSheetRef}
        index={activeSheet === "filter" ? 0 : -1}
        snapPoints={snapPoints}
        onClose={handleCloseSheet}
        enablePanDownToClose
      >
        <View className="p-4 bg-white rounded-t-lg shadow-lg">
          <Text className="text-lg font-bold mb-4 text-teal-700">
            Filter By
          </Text>
          {/* Filter Options */}
          <TouchableOpacity className="py-3 border-b border-gray-200">
            <Text className="text-gray-800">Date Range</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-3 border-b border-gray-200">
            <Text className="text-gray-800">Payment Method</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Sort Bottom Sheet */}
      <BottomSheet
        ref={sortSheetRef}
        index={activeSheet === "sort" ? 0 : -1}
        snapPoints={snapPoints}
        onClose={handleCloseSheet}
        enablePanDownToClose
      >
        <View className="p-4 bg-white rounded-t-lg shadow-lg">
          <Text className="text-lg font-bold mb-4 text-teal-700">Sort By</Text>
          {/* Sort Options */}
          <TouchableOpacity className="py-3 border-b border-gray-200">
            <Text className="text-gray-800">Amount (High to Low)</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-3 border-b border-gray-200">
            <Text className="text-gray-800">Date (Newest First)</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default PaymentHistory;
