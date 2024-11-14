/**
 * @swagger
 * /api/users/{id}/shop-timing:
 *   patch:
 *     summary: Update shop opening and closing times
 *     description: Allows authenticated users to update their shop's opening and closing times.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user (shop owner) to update shop timings for
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: true
 *         description: New shop timings
 *         schema:
 *           type: object
 *           properties:
 *             openingTime:
 *               type: string
 *               description: Shop opening time in HH:MM AM/PM format
 *               example: "09:00 AM"
 *             closingTime:
 *               type: string
 *               description: Shop closing time in HH:MM AM/PM format
 *               example: "09:00 PM"
 *     responses:
 *       200:
 *         description: Shop timings updated successfully
 *         schema:
 *           type: object
 *           properties:
 *             resultMessage:
 *               type: string
 *               description: Success message indicating shop timings were updated
 *             resultCode:
 *               type: string
 *               description: Success code
 *             user:
 *               type: object
 *               description: User object with updated shop timings
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: User ID
 *                 openingTime:
 *                   type: string
 *                   description: Updated opening time of the shop
 *                 closingTime:
 *                   type: string
 *                   description: Updated closing time of the shop
 *       400:
 *         description: Bad request due to invalid input
 *         schema:
 *           type: object
 *           properties:
 *             resultMessage:
 *               type: string
 *               description: Error message for validation issues
 *             resultCode:
 *               type: string
 *       404:
 *         description: User not found
 *         schema:
 *           type: object
 *           properties:
 *             resultMessage:
 *               type: string
 *               description: Error message indicating user not found
 *             resultCode:
 *               type: string
 *       500:
 *         description: Internal server error
 *         schema:
 *           type: object
 *           properties:
 *             resultMessage:
 *               type: string
 *               description: Error message for server error
 *             resultCode:
 *               type: string
 */


import { User } from "../../models/index.js";
import { errorHelper, logger, getText } from "../../utils/index.js";

export default async (req, res) => {
  

  // Find user by ID
  const user = await User.findById(req.params.id).catch((err) => {
    return res.status(500).json(errorHelper("00082", req, err.message));
  });
  if (!user) {
    return res.status(404).json(errorHelper("00087", req, "User not found"));
  }

  // Update shop's opening and closing time
  if (req.body.openingTime) user.openingTime = req.body.openingTime;
  if (req.body.closingTime) user.closingTime = req.body.closingTime;

  // Save the updated user/shop details
  await user.save().catch((err) => {
    return res.status(500).json(errorHelper("00085", req, err.message));
  });

  // Return success response
  logger("00086", req.user._id, getText("00086"), "Info", req);
  return res.status(200).json({
    resultMessage: getText("00086"),
    resultCode: "00086",
    user,
  });
};
