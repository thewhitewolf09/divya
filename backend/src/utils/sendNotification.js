import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const sendPushNotification = async (tokens, message) => {
  const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));
  
  if (!validTokens.length) {
    console.log("No valid Expo push tokens found.");
    return;
  }

  const messages = validTokens.map((token) => ({
    to: token,
    sound: "default",
    title: message.title,
    body: message.body,
    data: message.data || {},
    image: message.image,
  }));

  try {
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }
    console.log("Push notification tickets:", tickets);
  } catch (error) {
    console.error("Error sending push notifications:", error);
  }
};
