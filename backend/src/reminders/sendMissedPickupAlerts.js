import { getText } from "../../utils/index.js";
import { Customer, Notification } from "../models/index.js";
import { sendPushNotification } from "../utils/sendNotification.js";

export const sendMissedPickupAlerts = async () => {
  const today = new Date();
  
  // Find all customers with daily items where pickup is missed
  const customers = await Customer.find({
    "dailyItems.attendance.taken": false,  // Missed pickup condition
  }).populate("dailyItems.itemName");

  for (const customer of customers) {
    for (const dailyItem of customer.dailyItems) {
      // Check each attendance entry for missed pickups
      for (const attendance of dailyItem.attendance) {
        if (!attendance.taken) {  // If pickup is missed
          const message = {
            title: "Missed Pickup Alert",
            body: `You missed your scheduled pickup for ${dailyItem.itemName.name} on ${attendance.date.toLocaleDateString()}. Please reschedule at your convenience.`,
            data: {
              customerId: customer._id,
              itemId: dailyItem.itemName._id,
              attendanceId: attendance._id,
            },
          };

          // Send missed pickup alert notification to customer
          if (customer.deviceToken) {
            await sendPushNotification([customer.deviceToken], message);

            // Save notification in database
            await Notification.create({
              title: message.title,
              message: message.body,
              recipientRole: "customer",
              recipientId: customer._id,
            });
          }
        }
      }
    }
  }
};

// Cron job to run this function every 12 hours
setInterval(sendMissedPickupAlerts, 12 * 60 * 60 * 1000); // 12 hours interval
