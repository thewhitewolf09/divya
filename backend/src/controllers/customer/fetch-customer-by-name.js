/**
 * @swagger
 * /api/customers/search:
 *   get:
 *     summary: Search for customers by name
 *     description: Allows searching customers by their name. This endpoint performs a case-insensitive search based on the provided query parameter.
 *     tags:
 *       - Customer
 *     parameters:
 *       - name: name
 *         in: query
 *         required: true
 *         description: The name (or partial name) of the customer to search for.
 *         schema:
 *           type: string
 *           example: "John"
 *     responses:
 *       200:
 *         description: Successfully retrieved customers matching the search query.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Successfully retrieved customers."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 customers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       mobile:
 *                         type: string
 *                         example: "1234567890"
 *                       email:
 *                         type: string
 *                         example: "johndoe@example.com"
 *       400:
 *         description: Missing required query parameter 'name'.
 *       500:
 *         description: Internal server error.
 */

import { Customer, Sale } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { name } = req.query;

  // Validate query parameter
  if (!name) {
    return res.status(400).json({
      resultMessage:
        "Missing required query parameter 'name'. Please provide a valid name to search for.", // Missing required query parameter
      resultCode: "00022",
    });
  }

  try {
    // Create regex pattern for case-insensitive search
    const regex = new RegExp(name, "i");

    // Fetch customers with names matching the query
    const customers = await Customer.find({ name: { $regex: regex } });

    return res.status(200).json({
      resultMessage:
        "Successfully retrieved customers matching the name search.", // Success message
      resultCode: "00089",
      customers,
    });
  } catch (err) {
    console.error("Error searching customers:", err);
    return res.status(500).json({
      resultMessage: "Internal server error while searching customers.", // Error message
      resultCode: "00008",
      error: err.message,
    });
  }
};
