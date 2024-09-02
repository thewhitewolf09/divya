import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { EmptyState, SearchInput, EventCard } from "../../components";
import { BASE_URL } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";

const Search = () => {
  const { query } = useLocalSearchParams();
  const { userToken } = useGlobalContext();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = async (searchQuery) => {
    if (!searchQuery) return Alert.alert("OOPS", "Please enter a search query");

    setIsLoading(true);

    try {
      const response = await axios.get(
        `${BASE_URL}/users/search/${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      setEvents(response.data.events);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to fetch the searched events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(query);
  }, [query]);

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <EventCard
            title={item.title}
            location={item.eventLocation}
            eventId={item._id}
          />
        )}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4">
            <Text className="font-pmedium text-gray-100 text-sm">
              Search Results
            </Text>
            <Text className="text-2xl font-psemibold text-white mt-1">
              {`Searched: ${query}`}
            </Text>

            <View className="mt-6 mb-8">
              <SearchInput initialQuery={query} refetch={fetchEvents} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="OOPS"
            subtitle="No events found for this search query"
          />
        )}
        refreshing={isLoading}
        onRefresh={() => fetchEvents(query)}
      />
    </SafeAreaView>
  );
};

export default Search;
