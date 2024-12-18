import { Customer, Notification } from "../models/index.js";
import { sendPushNotification } from "../utils/sendNotification.js";

export const sendUdharPaymentReminders = async () => {
  const customers = await Customer.find({ creditBalance: { $gt: 0 } });

  for (const customer of customers) {
    const message = {
      title: "Udhar Payment Reminder",
      body: `You have an outstanding payment of ₹${customer.creditBalance}. Please pay at the earliest.`,
      data: { customerId: customer._id },
    };

    // Send reminder notification
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
};

// Cron job to run this function daily at 9 AM
setInterval(sendUdharPaymentReminders, 3*24 * 60 * 60 * 1000); // 24 hours interval
