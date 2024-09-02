import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { images } from ".././constants";

const EventCard = ({ title, location, eventId }) => {
  const router = useRouter();

  return (
    <View className="flex flex-col items-center px-4 mb-10">
      <View className="flex flex-row gap-3 items-start">
        <View className="flex justify-center items-center flex-row flex-1">
          <View className="w-[45px] h-[45px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
            <Image
              source={images.eventImage}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>

          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-200 font-pregular"
              numberOfLines={1}
            >
              At: {location}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push(`/event/${eventId}`)}
          className="bg-secondary p-2 rounded-md"
        >
          <Text className="text-xs text-white">View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EventCard;
