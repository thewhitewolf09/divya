import { useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  ScrollView,
} from "react-native";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";
import axios from "axios";
import { BASE_URL } from "../../constants";


const CreateEvent = () => {
  const { userToken } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    eventLocation: "",
    eventDate: "",
    registrationFee: "",
  });

  const createEvent = async (eventData, token) => {
    try {
      const response = await axios.post(`${BASE_URL}/events`, eventData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.resultMessage || "Error creating event"
      );
    }
  };

  const submit = async () => {
    if (
      form.title === "" ||
      form.description === "" ||
      form.eventLocation === "" ||
      form.eventDate === "" ||
      form.registrationFee === ""
    ) {
      return Alert.alert("Validation Error", "Please provide all required fields.");
    }

    setUploading(true);
    try {
      const data = {
        title: form.title,
        description: form.description,
        eventLocation: form.eventLocation,
        eventDate: form.eventDate,
        registrationFee: form.registrationFee,
      };

      await createEvent(data, userToken);

      Alert.alert("Success", "Event created successfully", [
        { text: "OK", onPress: () => router.push("/home") },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        title: "",
        description: "",
        eventLocation: "",
        eventDate: "",
        registrationFee: "",
      });
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">Create Event</Text>

        <FormField
          title="Event Title *"
          value={form.title}
          placeholder="Enter event title..."
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles="mt-10"
        />

        <FormField
          title="Description *"
          value={form.description}
          placeholder="Enter event description..."
          handleChangeText={(e) => setForm({ ...form, description: e })}
          otherStyles="mt-7"
        />

        <FormField
          title="Location *"
          value={form.eventLocation}
          placeholder="Enter event location..."
          handleChangeText={(e) => setForm({ ...form, eventLocation: e })}
          otherStyles="mt-7"
        />

        <FormField
          title="Event Date *"
          value={form.eventDate}
          placeholder="Format: DD/MM/YYYY"
          handleChangeText={(e) => setForm({ ...form, eventDate: e })}
          otherStyles="mt-7"
        />

        <FormField
          title="Registration Fee *"
          value={form.registrationFee}
          placeholder="Enter the fee in number..."
          handleChangeText={(e) => setForm({ ...form, registrationFee: e })}
          otherStyles="mt-7"
        />

        <CustomButton
          title="Submit & Create"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateEvent;
