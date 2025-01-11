/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get details of a customer by ID
 *     description: Fetches the details of a customer by their unique ID, including their associated shops, daily items, and the user who added them.
 *     tags:
 *       - Customer
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the customer.
 *         schema:
 *           type: string
 *           example: "60d60eafefbd070015f19a56"
 *     responses:
 *       200:
 *         description: Successfully retrieved customer details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Customer details fetched successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 customer:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d60eafefbd070015f19a56"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     mobile:
 *                       type: string
 *                       example: "1234567890"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     address:
 *                       type: string
 *                       example: "123 Street Name, City, Country"
 *                     shops:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d60eafefbd070015f19a57"
 *                           name:
 *                             type: string
 *                             example: "Shop Name"
 *                     dailyItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           itemName:
 *                             type: string
 *                             example: "Item 1"
 *                           quantity:
 *                             type: integer
 *                             example: 10
 *                     addedBy:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d60eafefbd070015f19a50"
 *                         name:
 *                           type: string
 *                           example: "Admin User"
 *       400:
 *         description: Invalid customer ID.
 *       404:
 *         description: Customer not found with the given ID.
 *       500:
 *         description: Internal server error.
 */

import { Customer } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;

  // Validate the ID
  if (!id) {
    return res.status(400).json({
      resultMessage: "Customer ID is required.", // Missing customer ID
      resultCode: "00025",
    });
  }

  try {
    // Fetch customer details from the database
    const customer = await Customer.findById(id)
      .populate("addedBy")
      .populate("shops")
      .populate("dailyItems.itemName")
      .lean()
      .exec();

    if (!customer) {
      return res.status(404).json({
        resultMessage: "Customer not found.", // Customer not found
        resultCode: "00026",
      });
    }

    // Respond with customer details
    return res.status(200).json({
      resultMessage: "Customer details retrieved successfully.", // Success message
      resultCode: "00089",
      customer,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      resultMessage: "Internal server error while fetching customer details.", // Error message
      resultCode: "00090",
      error: err.message,
    });
  }
};
