/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a specific notification.
 *     description: Deletes a notification by its unique ID.
 *     tags:
 *       - Notification
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the notification to be deleted.
 *         schema:
 *           type: string
 *           example: "64fa2c9b7e2b5b6eec3d2a79"
 *     responses:
 *       200:
 *         description: Notification deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Success message.
 *                   example: "Notification successfully deleted."
 *                 resultCode:
 *                   type: string
 *                   description: Response code.
 *                   example: "00103"
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
 *       404:
 *         description: Notification not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message.
 *                   example: "Notification not found."
 *                 resultCode:
 *                   type: string
 *                   description: Error code.
 *                   example: "00028"
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
  const { id } = req.params;

  // Validate required parameter
  if (!id) {
    return res.status(400).json({
      resultMessage: "Required fields are missing.",
      resultCode: "00025",
    });
  }

  try {
    // Attempt to delete the notification by id
    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return res.status(404).json({
        resultMessage: "Notification not found.",
        resultCode: "00028",
      });
    }

    // Return success response
    return res.status(200).json({
      resultMessage: "Notification successfully deleted.",
      resultCode: "00103",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Internal server error response
  }
};
