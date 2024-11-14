import { useState, useEffect } from "react";
import { View, TextInput } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const SearchInput = ({
  initialQuery,
  products = [],
  customers = [],
  setFilteredResults = () => {}, // Default empty function to prevent errors
  placeholder,
}) => {
  const [query, setQuery] = useState(initialQuery || "");

  // Debounced search function to avoid too many re-renders
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query !== "") {
        const searchQuery = query.toLowerCase();

        // Filter products based on name
        const filteredProducts = products.filter((product) =>
          product.name.toLowerCase().includes(searchQuery)
        );

        // Filter customers based on name, mobile, or other relevant fields
        const filteredCustomers = customers.filter(
          (customer) =>
            customer.name.toLowerCase().includes(searchQuery) ||
            customer.mobile.includes(searchQuery) || // Search by mobile number
            (customer.address && customer.address.city.toLowerCase().includes(searchQuery)) || // Search by city
            (customer.address && customer.address.state.toLowerCase().includes(searchQuery)) || // Search by state
            (customer.address && customer.address.country.toLowerCase().includes(searchQuery)) // Search by country
        );

        // Combine filtered products and customers into a single result list
        setFilteredResults([...filteredProducts, ...filteredCustomers]);
      } else {
        // If query is empty, clear the results
        setFilteredResults([...customers, ...products]);
      }
    }, 300); // Debounce time of 300ms to delay the search

    return () => clearTimeout(timeoutId); // Cleanup timeout on unmount or query change
  }, [query, products, customers, setFilteredResults]);

  return (
    <View className="flex flex-row items-center space-x-4 w-full h-16 px-4 mb-3 bg-white rounded-2xl border-2 border-teal-600 focus:border-secondary">
      <TextInput
        className="text-base mt-0.5 text-gray flex-1 font-semibold font-pregular"
        value={query}
        placeholder={placeholder || "Search a Product or Customer"}
        placeholderTextColor="gray"
        onChangeText={(text) => setQuery(text)} // Update the query state
      />

      <Icon name="search" size={24} color="#50B498" />
    </View>
  );
};

export default SearchInput;
