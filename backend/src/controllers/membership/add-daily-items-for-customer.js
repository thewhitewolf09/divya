/**
 * @swagger
 * /api/customers/{id}/daily-items:
 *   post:
 *     summary: Add a daily item for a customer
 *     description: Adds a daily item (product) to a customer's record with the specified quantity per day.
 *     tags:
 *       - Membership
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the customer to whom the daily item will be added.
 *         schema:
 *           type: string
 *           example: "60d5f7f3b6b8f62b8b9f3c6d"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemName:
 *                 type: string
 *                 description: The name of the product to be added as a daily item.
 *                 example: "Milk"
 *               quantityPerDay:
 *                 type: number
 *                 description: The quantity of the product to be consumed daily.
 *                 example: 2
 *     responses:
 *       201:
 *         description: Successfully added the daily item to the customer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Successfully added daily item"
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Missing required fields, item already exists, or invalid input.
 *       404:
 *         description: Customer or product not found.
 *       500:
 *         description: Internal server error.
 */

import { Customer, Product } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const { itemName, quantityPerDay } = req.body;

  // Validate required fields
  if (!id || !itemName || quantityPerDay === undefined) {
    return res.status(400).json({
      resultMessage: "Missing required fields.",
      resultCode: "00022",
    });
  }

  try {
    // Find the customer
    const customer = await Customer.findById(id)
      .populate("addedBy")
      .populate("shops")
      .populate("dailyItems.itemName")
      .exec();

    if (!customer) {
      return res.status(404).json({
        resultMessage: "Customer not found.",
        resultCode: "00052",
      });
    }

    // Initialize dailyItems if it's undefined
    if (!Array.isArray(customer.dailyItems)) {
      customer.dailyItems = [];
    }

    // Find the product by itemName to get its price
    const product = await Product.findOne({ name: itemName });
    if (!product) {
      return res.status(404).json({
        resultMessage: "Product not found.",
        resultCode: "00093",
      });
    }

    // Create the daily item entry
    const dailyItem = {
      itemName: product._id,
      quantityPerDay,
      attendance: [],
    };

    // Check if the daily item already exists
    const existingItem = customer.dailyItems.find(
      (item) => item.itemName === itemName
    );

    if (existingItem) {
      return res.status(400).json({
        resultMessage: "Item already exists.",
        resultCode: "00022",
      });
    }

    // Add the new daily item to the customer's record
    customer.dailyItems.push(dailyItem);

    const updatedCustomer = await customer.save();

    return res.status(201).json({
      resultMessage: "Successfully added daily item.",
      resultCode: "00089",
      customer: updatedCustomer,
    });
  } catch (err) {
    console.log("Error adding daily item for customer:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Internal server error
  }
};
