import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../../components"; // Ensure this path is correct
import { BarChart, PieChart } from "react-native-chart-kit";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import {
  getMonthlySales,
  getSalesByDateRange,
} from "../../redux/slices/saleSlice";

const SalesPerformanceScreen = () => {
  const dispatch = useDispatch();
  const { sales, loading, error } = useSelector((state) => state.sale);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [salesByProduct, setSalesByProduct] = useState({});


  useEffect(() => {
    const fetchMonthlySaleData = async () => {
      await dispatch(getMonthlySales());
    };

    fetchMonthlySaleData();
  }, []);

  useEffect(() => {
    calculateTopSellingProducts();
  }, [sales]);

  const fetchDateWiseSaleData = async (startDate, endDate) => {
    try {
      // Attempt to fetch the sales data within the date range
      await dispatch(
        getSalesByDateRange({
          startDate: startDate.toLocaleDateString(),
          endDate: endDate.toLocaleDateString(),
        })
      ).unwrap();
    } catch (error) {
      // Handle the error here
      const errorMessage =
        error?.resultMessage || "An error occurred while fetching sales data.";

      Alert.alert("Error", errorMessage);
    }
  };

  // Calculate total sales and transactions
  const totalSales = sales.reduce(
    (acc, sale) => acc + sale.price * sale.quantity,
    0
  );
  const totalTransactions = sales.length;

  // Calculate metrics
  const monthlySalesGrowth = "10";

  const averageOrderValue =
    totalTransactions > 0
      ? (totalSales / totalTransactions).toFixed(2)
      : "0.00";

  // Function to calculate top-selling products
  const calculateTopSellingProducts = () => {
    if (!sales || sales.length === 0) {
      setTopSellingProducts([]);
      return;
    }

    const updatedSalesByProduct = { ...salesByProduct }; // Create a copy of the state object

    sales.forEach((sale) => {
      const productName = sale.productId?.name;
      if (!productName) return;

      if (!updatedSalesByProduct[productName]) {
        updatedSalesByProduct[productName] = {
          sales: 0,
          quantity: 0,
        };
      }
      updatedSalesByProduct[productName].sales += sale.price * sale.quantity;
      updatedSalesByProduct[productName].quantity += sale.quantity;
    });

    setSalesByProduct(updatedSalesByProduct); // Update the state with the modified object

    const topProducts = Object.keys(updatedSalesByProduct)
      .map((productName) => ({
        name: productName,
        sales: updatedSalesByProduct[productName].sales,
        quantity: updatedSalesByProduct[productName].quantity,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    setTopSellingProducts(topProducts);
  };

  // Sales by payment method
  const cashSales = sales.filter((sale) => !sale.isCredit);
  const creditSales = sales.filter((sale) => sale.isCredit);

  const cashBalance = cashSales.reduce(
    (acc, sale) => acc + sale.price * sale.quantity,
    0
  );
  const creditBalance = creditSales.reduce(
    (acc, sale) => acc + sale.price * sale.quantity,
    0
  );
  const totalBalance = cashBalance + creditBalance;

  // Pie Chart data
  const pieData = [
    {
      name: "Cash/Online",
      population: cashSales.length,
      color: "#28A745", // Green for cash
      legendFontColor: "#28A745",
      legendFontSize: 15,
    },
    {
      name: "Credit",
      population: creditSales.length,
      color: "#FFC107", // Yellow for credit
      legendFontColor: "#FFC107",
      legendFontSize: 15,
    },
  ];

  // Screen width for chart responsiveness
  const screenWidth = Dimensions.get("window").width;

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className="flex flex-col my-3 px-4 space-y-6">
          {/* Header */}
          <View className="flex-row items-center mb-6">
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
              Sales Performance Overview
            </Text>
          </View>

          {/* Date Range Selection */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-teal-700 mb-4">
              Select Date Range
            </Text>

            {/* Start Date Picker */}
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              className="mb-4"
              style={{
                borderWidth: 1,
                borderColor: "#00B4DB",
                borderRadius: 10,
                padding: 14,
                backgroundColor: "white",
              }}
            >
              <Text className="text-gray-800 text-lg">
                Start Date: {startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {/* End Date Picker */}
            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              style={{
                borderWidth: 1,
                borderColor: "#00B4DB",
                borderRadius: 10,
                padding: 14,
                backgroundColor: "white",
              }}
            >
              <Text className="text-gray-800 text-lg">
                End Date: {endDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {/* Date Pickers */}
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowStartPicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowEndPicker(false);
                  if (date) setEndDate(date);
                }}
              />
            )}

            {/* Fetch Sales Data Button */}
            <CustomButton
              title="Fetch Sales Data"
              handlePress={() => fetchDateWiseSaleData(startDate, endDate)}
              containerStyles="mt-2"
            />
          </View>

          {/* Metrics Section */}
          <View className="mt-6">
            <Text className="text-lg text-teal-700 font-bold mb-4">
              Metrics Overview
            </Text>

            {/* Month and Year Display */}
            <Text className="text-lg text-gray-600 mb-4">
              Data for:{" "}
              {new Date(startDate).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </Text>

            {/* Key Metrics */}
            <View className="flex-row justify-between mb-4">
              {/* Total Monthly Sales Card */}
              <View className="bg-white p-4 rounded-lg flex-1 mr-2 shadow-lg border border-teal-600 w-1/2">
                <Text className="text-base font-semibold text-teal-700 mb-2">
                  Total Monthly Sales
                </Text>
                <Text className="text-xl font-bold text-teal-800">
                  {totalSales.toFixed(2)} INR
                </Text>
                <Text className="text-sm text-gray-600">
                  Total sales for the selected period.
                </Text>
              </View>

              {/* Sales Growth Card */}
              <View className="bg-white p-4 rounded-lg flex-1 ml-2 shadow-lg border border-teal-600 w-1/2">
                <Text className="text-base font-semibold text-teal-700 mb-2">
                  Sales Growth (MoM)
                </Text>
                <Text className="text-xl font-bold text-teal-800">
                  {monthlySalesGrowth}%
                </Text>
                <Text className="text-sm text-gray-600">
                  Comparison to last month's sales.
                </Text>
              </View>
            </View>

            {/* Top-Selling Products Section */}
            <View className="mb-4">
              <Text className="text-lg font-semibold mb-2 text-teal-700">
                Top-Selling Products
              </Text>

              <View className="bg-gray-50 p-4 rounded-lg shadow-lg">
                {topSellingProducts.length === 0 ? (
                  <Text>
                    No top-selling products available for the selected date
                    range.
                  </Text>
                ) : (
                  topSellingProducts.map((product, index) => (
                    <View
                      key={index}
                      className="flex-row justify-between items-center p-3 mb-2 bg-white rounded-lg shadow-md border border-gray-200"
                    >
                      <Text className="text-md text-teal-700 font-semibold">
                        {index + 1}. {product.name}
                      </Text>
                      <Text className="text-md text-teal-700 font-semibold">
                        {product.sales.toFixed(2)} INR
                      </Text>
                    </View>
                  ))
                )}

                <Text className="text-sm text-gray-600 mt-2">
                  Top 5 products sold in the selected period.
                </Text>
              </View>
            </View>

            {/* Additional Metrics */}
            <View className="flex-row justify-between mb-4">
              {/* Average Order Value Card */}
              <View className="bg-white p-4 rounded-lg flex-1 mr-2 shadow-lg border border-teal-600 w-1/2">
                <Text className="text-base font-semibold text-teal-700 mb-2">
                  Average Order Value
                </Text>
                <Text className="text-xl font-bold text-teal-800">
                  {averageOrderValue} INR
                </Text>
                <Text className="text-sm text-gray-600">
                  Average amount spent per transaction.
                </Text>
              </View>

              {/* Total Transactions Card */}
              <View className="bg-white p-4 rounded-lg flex-1 ml-2 shadow-lg border border-teal-600 w-1/2">
                <Text className="text-base font-semibold text-teal-700 mb-2">
                  Total Transactions
                </Text>
                <Text className="text-xl font-bold text-teal-800">
                  {totalTransactions}
                </Text>
                <Text className="text-sm text-gray-600">
                  Total number of sales transactions.
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Method Breakdown */}
          <View className="mb-4">
            <Text className="text-lg font-semibold mb-4 text-teal-700">
              Payment Method Breakdown
            </Text>

            {/* Payment Details Container */}
            <View className="flex-col space-y-3">
              {/* Cash Sales Card */}
              <View className="bg-teal-100 p-4 rounded-lg shadow-md border border-teal-300">
                <Text className="text-md font-semibold text-teal-700">
                  Total Cash/Online Sales
                </Text>
                <Text className="text-xl font-bold text-teal-800">
                  {cashBalance.toFixed(2)} INR
                </Text>
              </View>

              {/* Credit Sales Card */}
              <View className="bg-yellow-100 p-4 rounded-lg shadow-md border border-yellow-300">
                <Text className="text-md font-semibold text-teal-700">
                  Total Credit Sales
                </Text>
                <Text className="text-xl font-bold text-teal-800">
                  {creditBalance.toFixed(2)} INR
                </Text>
              </View>

              {/* Total Balance Card */}
              <View className="bg-teal-200 p-4 rounded-lg shadow-md border border-teal-400">
                <Text className="text-lg font-semibold text-teal-800">
                  Total Balance
                </Text>
                <Text className="text-2xl font-bold text-teal-900">
                  {totalBalance.toFixed(2)} INR
                </Text>
              </View>
            </View>
          </View>

          {/* Bar Chart */}
          <View>
            <Text className="text-lg font-semibold mb-2 text-teal-700">
              Sales Overview
            </Text>
            <BarChart
              data={{
                labels: ["Cash/Online", "Credit"],
                datasets: [
                  {
                    data: [cashBalance, creditBalance],
                  },
                ],
              }}
              width={screenWidth - 32} // Adjust width according to screen size
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 139, 139, ${opacity})`, // Default color for Cash and Online
                labelColor: (opacity = 1) => `rgba(0, 100, 100, ${opacity})`, // Change label color
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#00B4DB",
                },
                propsForBackgroundLines: {
                  strokeDasharray: "", // Remove dashes from background lines
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              fromZero={true} // Ensure the chart starts from zero
              // Customizing the bar colors directly through chartConfig (only one color for all bars)
              // You can conditionally modify the color based on value or any other criteria here if needed
            />
          </View>

          {/* Pie Chart */}
          <View>
            <Text className="text-lg font-semibold mb-2 text-teal-700">
              Payment Method Distribution
            </Text>
            <PieChart
              data={pieData}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                color: (opacity = 1) => `rgba(0, 139, 139, ${opacity})`, // You can customize the colors here
                labelColor: (opacity = 1) => `rgba(0, 139, 139, ${opacity})`, // Change label color
                style: {
                  borderRadius: 16,
                },
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute // Show absolute values in the pie chart
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SalesPerformanceScreen;
