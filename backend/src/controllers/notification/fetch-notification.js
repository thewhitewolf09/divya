/**
 * @swagger
 * /api/notifications/{role}/{id}:
 *   get:
 *     summary: Fetch notifications for a specific role and recipient ID.
 *     description: Retrieve a list of notifications for a specific role (`shopOwner` or `customer`) and recipient ID, sorted by the newest first.
 *     tags:
 *       - Notification
 *     parameters:
 *       - name: role
 *         in: path
 *         required: true
 *         description: The role of the recipient (e.g., `shopOwner` or `customer`).
 *         schema:
 *           type: string
 *           enum:
 *             - shopOwner
 *             - customer
 *           example: "customer"
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the recipient.
 *         schema:
 *           type: string
 *           example: "64fa2c9b7e2b5b6eec3d2a79"
 *     responses:
 *       200:
 *         description: Notifications fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Success message.
 *                   example: "Notifications fetched successfully."
 *                 resultCode:
 *                   type: string
 *                   description: Response code.
 *                   example: "00101"
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
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

import { Notification } from "../../models/index.js"; // Import Notification model
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { role, id } = req.params;

  // Validate required parameters
  if (!role || !id) {
    return res.status(400).json({
      resultMessage: "Required fields are missing.",
      resultCode: "00025",
    });
  }

  try {
    // Validate recipient role
    const validRoles = ["shopOwner", "customer"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        resultMessage: "Invalid recipient role.",
        resultCode: "00026",
      });
    }

    // Fetch notifications for the role and recipientId
    const notifications = await Notification.find({
      recipientRole: role,
      recipientId: id,
    }).sort({ createdAt: -1 }); // Sort by newest first

    // Return notifications
    return res.status(200).json({
      resultMessage: "Notifications fetched successfully.",
      resultCode: "00101",
      notifications,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Internal server error response
  }
};
