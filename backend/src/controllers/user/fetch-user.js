/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Retrieve user details by user ID.
 *     description: Fetches a user’s details from the database using their unique ID.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the user.
 *         example: "615c8b6e76fe76327b80c1a5"
 *     responses:
 *       200:
 *         description: Successfully retrieved user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "User details retrieved successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "615c8b6e76fe76327b80c1a5"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     mobile:
 *                       type: string
 *                       example: "1234567890"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     role:
 *                       type: string
 *                       example: "shopOwner"
 *                     # Include other relevant user fields as per your model.
 *       400:
 *         description: User ID not provided or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorCode:
 *                   type: string
 *                   example: "00088"
 *                 errorMessage:
 *                   type: string
 *                   example: "User ID is required."
 *       500:
 *         description: Internal server error during user retrieval.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorCode:
 *                   type: string
 *                   example: "00088"
 *                 errorMessage:
 *                   type: string
 *                   example: "Internal server error."
 */


import { User } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).catch((err) => {
    return res.status(500).json(errorHelper("00088", req, err.message));
  });

  
  return res.status(200).json({
    resultMessage: getText("00089"),
    resultCode: "00089",
    user,
  });
};
