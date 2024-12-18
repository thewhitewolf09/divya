/**
 * @swagger
 * /api/shops:
 *   get:
 *     summary: Retrieve a list of shops.
 *     description: Fetches a list of users with the role "shopOwner" from the database.
 *     tags:
 *       - Shop
 *     responses:
 *       200:
 *         description: Successfully retrieved the shop list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Shop list retrieved successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00090"
 *                 shops:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "615c8b6e76fe76327b80c1a5"
 *                       name:
 *                         type: string
 *                         example: "John's Electronics"
 *                       mobile:
 *                         type: string
 *                         example: "1234567890"
 *                       email:
 *                         type: string
 *                         example: "shopowner@example.com"
 *                       shopLocation:
 *                         type: object
 *                         properties:
 *                           address:
 *                             type: object
 *                             properties:
 *                               street:
 *                                 type: string
 *                                 example: "123 Main St"
 *                               city:
 *                                 type: string
 *                                 example: "Metropolis"
 *                               state:
 *                                 type: string
 *                                 example: "State"
 *                               country:
 *                                 type: string
 *                                 example: "Country"
 *                           googleMapLocation:
 *                             type: object
 *                             properties:
 *                               latitude:
 *                                 type: number
 *                                 example: 40.712776
 *                               longitude:
 *                                 type: number
 *                                 example: -74.005974
 *       500:
 *         description: Internal server error during shop list retrieval.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorCode:
 *                   type: string
 *                   example: "00091"
 *                 errorMessage:
 *                   type: string
 *                   example: "Internal server error."
 */

import { User } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  try {
    // Fetch all users with the role "shopOwner"
    const shops = await User.find({ role: "shopOwner" })
      .select("_id name mobile shopLocation").lean()
      .catch((err) => {
        throw new Error(err.message);
      });

    if (!shops || shops.length === 0) {
      return res.status(404).json({
        resultCode: "00092",
        resultMessage: "No shops found.",
      });
    }

    return res.status(200).json({
      resultMessage: getText("00090"),
      resultCode: "00090",
      shops,
    });
  } catch (err) {
    return res.status(500).json(errorHelper("00091", req, err.message));
  }
};
