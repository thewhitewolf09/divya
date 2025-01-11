/**
 * @swagger
 * /api/notifications/create:
 *   post:
 *     summary: Create a new notification.
 *     description: This endpoint allows the creation of a notification for a specific recipient role and ID. A notification can include a title, message, and an optional image URL.
 *     tags:
 *       - Notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - recipientRole
 *               - recipientId
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the notification.
 *                 example: "Order Dispatched"
 *               message:
 *                 type: string
 *                 description: The content of the notification.
 *                 example: "Your order has been dispatched and will arrive soon."
 *               recipientRole:
 *                 type: string
 *                 description: The role of the notification recipient. Must be either 'shopOwner' or 'customer'.
 *                 enum:
 *                   - shopOwner
 *                   - customer
 *                 example: "customer"
 *               recipientId:
 *                 type: string
 *                 description: The unique ID of the recipient.
 *                 example: "64fa2c9b7e2b5b6eec3d2a79"
 *               imageUrl:
 *                 type: string
 *                 description: (Optional) URL of an image to include with the notification.
 *                 example: "https://example.com/image.png"
 *     responses:
 *       201:
 *         description: Notification created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Success message.
 *                   example: "Notification created successfully."
 *                 resultCode:
 *                   type: string
 *                   description: Response code.
 *                   example: "00100"
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Validation error due to missing or invalid fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message.
 *                   example: "Required fields are missing."
 *                 resultCode:
 *                   type: string
 *                   description: Error code.
 *                   example: "00025"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message.
 *                   example: "An unexpected error occurred."
 *                 resultCode:
 *                   type: string
 *                   description: Error code.
 *                   example: "00090"
 */



import { Notification } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { title, message, recipientRole, recipientId, imageUrl } = req.body;

  // Validate required fields
  if (!title || !message || !recipientRole || !recipientId) {
    return res.status(400).json({
      resultMessage: "Required fields are missing.",
      resultCode: "00025",
    });
  }

  try {
    // Validate recipientRole
    const validRoles = ["shopOwner", "customer"];
    if (!validRoles.includes(recipientRole)) {
      return res.status(400).json({
        resultMessage: "Invalid recipient role.",
        resultCode: "00026",
      });
    }

    // Create the notification
    const newNotification = new Notification({
      title,
      message,
      recipientRole,
      recipientId,
      imageUrl: imageUrl || null, // Optional image URL
    });

    // Save the notification to the database
    const savedNotification = await newNotification.save();

    // Return success response
    return res.status(201).json({
      resultMessage: "Notification created successfully.",
      resultCode: "00100",
      notification: savedNotification,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Internal server error response
  }
};
