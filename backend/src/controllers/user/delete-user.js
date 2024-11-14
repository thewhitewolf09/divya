/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (shop owner) by ID
 *     description: Allows authenticated users to delete their profile or a shop owner by ID.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user (shop owner) to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User successfully deleted
 *         schema:
 *           type: object
 *           properties:
 *             resultMessage:
 *               type: string
 *               description: Success message indicating the user was deleted
 *             resultCode:
 *               type: string
 *               description: Success code
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
  try {
    // Find and delete the user/shop by ID
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json(errorHelper("00087", req, "User not found"));
    }

    // Log the deletion
    logger("00093", req.params.id, getText("00093"), "Info", req);
    
    // Return success response
    return res.status(200).json({
      resultMessage: getText("00093"),
      resultCode: "00093",
    });

  } catch (err) {
    // Handle errors
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
