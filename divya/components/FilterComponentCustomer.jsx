import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  FlatList,
} from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useDispatch, useSelector } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";
import { fetchAllCustomers } from "../redux/slices/customerSlice";


const FilterComponentCustomer = ({
  filterSheetRef,
  snapPoints,
  activeSheet,
  setActiveSheet,
  setFilterApplied,
  filterApplied,
}) => {
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.customer);

  const [isMembershipActive, setIsMembershipActive] = useState(false);
  const [purchaseRange, setPurchaseRange] = useState([0, 100000]);
  const [balanceRange, setBalanceRange] = useState([0, 100000]);
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (customers.length > 0) {
      const purchases = customers.map((c) => c.totalPurchases || 0);
      const balances = customers.map((c) => c.creditBalance || 0);
  
      // Calculate the minimum and maximum purchases
      const minPurchase = Math.min(...purchases);
      const maxPurchase = Math.max(...purchases);
  
      // Calculate the minimum and maximum balances
      const minBalance = Math.min(...balances);
      const maxBalance = Math.max(...balances);
  
      // Round to the nearest multiple of 100
      const roundedMinPurchase = Math.floor(minPurchase / 100) * 100;
      const roundedMaxPurchase = Math.ceil(maxPurchase / 100) * 100;
      const roundedMinBalance = Math.floor(minBalance / 100) * 100;
      const roundedMaxBalance = Math.ceil(maxBalance / 100) * 100;
  
      // Handle cases where min and max values are the same
      setPurchaseRange(
        roundedMinPurchase === roundedMaxPurchase
          ? [roundedMinPurchase, roundedMinPurchase + 100]
          : [roundedMinPurchase, roundedMaxPurchase]
      );
  
      setBalanceRange(
        roundedMinBalance === roundedMaxBalance
          ? [roundedMinBalance, roundedMinBalance + 100]
          : [roundedMinBalance, roundedMaxBalance]
      );
    }
  }, [customers]);
  

  const toggleAccordion = (key) => {
    setExpandedFilter((prev) => (prev === key ? null : key));
  };

  const handleApplyFilters = async () => {
    setIsLoading(true);
    try {
      const filters = {};
  
      // Include only if isMembershipActive is true
      if (isMembershipActive) {
        filters.membershipStatus = isMembershipActive;
      }
  
      // Include purchase range only if it differs from the default range
      if (purchaseRange[0] !== 0 || purchaseRange[1] !== 100000) {
        filters.minPurchases = purchaseRange[0];
        filters.maxPurchases = purchaseRange[1];
      }
  
      // Include balance range only if it differs from the default range
      if (balanceRange[0] !== 0 || balanceRange[1] !== 100000) {
        filters.minBalance = balanceRange[0];
        filters.maxBalance = balanceRange[1];
      }
  
      // Send filters only if any filters are applied
      if (Object.keys(filters).length > 0) {
        await dispatch(fetchAllCustomers({ filters })).unwrap();
        setFilterApplied(true);
      } else {
        // If no filters, fetch all customers
        await dispatch(fetchAllCustomers()).unwrap();
      }
  
      filterSheetRef.current?.close();
    } catch (err) {
      console.error("Error applying filters:", err);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleClearFilters = async () => {
    try {
      await dispatch(fetchAllCustomers()).unwrap();
      setIsMembershipActive(false);
      setPurchaseRange([0, 100000]);
      setBalanceRange([0, 100000]);
      setFilterApplied(false);
    } catch (err) {
      console.error("Error clearing filters:", err);
    }
  };

  const renderBackdrop = (props) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.7}
      pressBehavior="close"
    />
  );

  return (
    <BottomSheet
      ref={filterSheetRef}
      index={activeSheet === "filter" ? 0 : -1}
      snapPoints={snapPoints}
      onClose={() => setActiveSheet(null)}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
    >
      <BottomSheetScrollView
        contentContainerStyle={{ padding: 16, backgroundColor: "white" }}
      >
        <View className="flex flex-row justify-between items-center">
          <Text className="text-lg font-bold mb-4 text-teal-700">Filters</Text>

          {filterApplied && (
            <TouchableOpacity
              onPress={handleClearFilters}
              className="flex flex-row items-center border-2 border-gray-400 rounded-full px-3 py-1 bg-transparent"
            >
              <Text className="text-gray-700 font-semibold mr-2">Clear</Text>
              <Ionicons name="close-outline" size={20} color="#4B5563" />
            </TouchableOpacity>
          )}
        </View>

        {/* Purchase Range */}
        <TouchableOpacity
          onPress={() => toggleAccordion("purchase")}
          className="py-3 border-b border-gray-200"
        >
          <Text className="text-gray-800 text-base">Total Purchases</Text>
        </TouchableOpacity>
        {expandedFilter === "purchase" && (
          <View className="p-4">
            <Text className="text-gray-800 mb-2">
              ₹{purchaseRange[0]} - ₹{purchaseRange[1]}
            </Text>
            <MultiSlider
              values={purchaseRange}
              min={0}
              max={10000}
              step={100}
              onValuesChange={(values) => setPurchaseRange(values)}
              selectedStyle={{ backgroundColor: "#0f766e" }}
              markerStyle={{ backgroundColor: "#0f766e" }}
            />
          </View>
        )}

        {/* Balance Range */}
        <TouchableOpacity
          onPress={() => toggleAccordion("balance")}
          className="py-3 border-b border-gray-200"
        >
          <Text className="text-gray-800 text-base">Credit Balance</Text>
        </TouchableOpacity>
        {expandedFilter === "balance" && (
          <View className="p-4">
            <Text className="text-gray-800 mb-2">
              ₹{balanceRange[0]} - ₹{balanceRange[1]}
            </Text>
            <MultiSlider
              values={balanceRange}
              min={0}
              max={10000}
              step={100}
              onValuesChange={(values) => setBalanceRange(values)}
              selectedStyle={{ backgroundColor: "#0f766e" }}
              markerStyle={{ backgroundColor: "#0f766e" }}
            />
          </View>
        )}

        <View className="py-3 border-b border-gray-200 flex-row justify-between items-center">
          <Text className="text-gray-800 text-base">Active Membership</Text>
          <Switch
            value={isMembershipActive}
            onValueChange={setIsMembershipActive}
          />
        </View>

        {/* Apply Filters Button */}
        <TouchableOpacity
          onPress={handleApplyFilters}
          disabled={isLoading}
          className={`mt-4 rounded py-2 px-4 ${
            isLoading ? "bg-gray-400" : "bg-teal-600"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            {isLoading ? "Applying..." : "Apply Filters"}
          </Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default FilterComponentCustomer;
