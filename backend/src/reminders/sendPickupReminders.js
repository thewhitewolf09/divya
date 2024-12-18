import { getText } from "../../utils/index.js";
import { Customer, Notification } from "../models/index.js";
import { sendPushNotification } from "../utils/sendNotification.js";

export const sendPickupReminders = async () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // Pickup for tomorrow

  // Find all customers with items scheduled for pickup tomorrow
  const customers = await Customer.find({
    "dailyItems.attendance.date": {
      $gte: tomorrow.setHours(0, 0, 0, 0), // Tomorrow's date from 00:00
      $lt: tomorrow.setHours(23, 59, 59, 999), // Tomorrow's date until 23:59
    },
  }).populate("dailyItems.itemName");

  for (const customer of customers) {
    for (const dailyItem of customer.dailyItems) {
      // Find attendance entries for tomorrow
      for (const attendance of dailyItem.attendance) {
        if (
          attendance.date.toLocaleDateString() ===
            tomorrow.toLocaleDateString() &&
          !attendance.taken
        ) {
          const message = {
            title: "Item Pickup Reminder",
            body: `Your pickup for ${dailyItem.itemName.name} is scheduled for tomorrow. Please ensure the successfull delivery.`,
            data: {
              customerId: customer._id,
              itemId: dailyItem.itemName._id,
              attendanceId: attendance._id,
            },
          };

          // Send reminder notification to customer
          if (customer.deviceToken) {
            await sendPushNotification([customer.deviceToken], message);

            // Save notification in the database
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

// Cron job to run this function daily at 8 AM
setInterval(sendPickupReminders, 24 * 60 * 60 * 1000); // 24 hours interval
