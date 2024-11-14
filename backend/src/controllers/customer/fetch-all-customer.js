/**
 * @swagger
 * /api/customers/all:
 *   get:
 *     summary: Get all customers with optional filters
 *     description: Fetches a list of all customers with optional query filters like name, registration date range, membership status, total purchases, and credit balance.
 *     tags:
 *       - Customer
 *     parameters:
 *       - in: query
 *         name: name
 *         required: false
 *         description: Filter customers by name (supports partial match).
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: false
 *         description: Filter customers by registration start date (ISO date format).
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: false
 *         description: Filter customers by registration end date (ISO date format).
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: membershipStatus
 *         required: false
 *         description: Filter customers by their membership status.
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended] # Replace with valid statuses if different
 *       - in: query
 *         name: minPurchases
 *         required: false
 *         description: Filter customers by minimum total purchases.
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: maxPurchases
 *         required: false
 *         description: Filter customers by maximum total purchases.
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: minBalance
 *         required: false
 *         description: Filter customers by minimum credit balance.
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: maxBalance
 *         required: false
 *         description: Filter customers by maximum credit balance.
 *         schema:
 *           type: number
 *           format: float
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of customers based on the filters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Successfully retrieved customers"
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
 *                       membershipStatus:
 *                         type: string
 *                         example: "active"
 *                       creditBalance:
 *                         type: number
 *                         example: 150.5
 *                       totalPurchases:
 *                         type: number
 *                         example: 5000
 *       400:
 *         description: Invalid query parameters.
 *       500:
 *         description: Internal server error.
 */




import { Customer, Sale } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const {
    name,
    startDate,
    endDate,
    membershipStatus,
    minPurchases,
    maxPurchases,
    minBalance,
    maxBalance,
  } = req.query;

  try {
    // Build the query object
    let query = {};

    if (name) {
      query.name = { $regex: new RegExp(name, "i") }; // Case-insensitive search
    }

    if (startDate || endDate) {
      query.registrationDate = {};
      if (startDate) {
        query.registrationDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.registrationDate.$lte = new Date(endDate);
      }
    }

    if (membershipStatus) {
      query.membershipStatus = membershipStatus;
    }

    if (minPurchases || maxPurchases) {
      query.totalPurchases = {};
      if (minPurchases) {
        query.totalPurchases.$gte = minPurchases;
      }
      if (maxPurchases) {
        query.totalPurchases.$lte = maxPurchases;
      }
    }

    if (minBalance || maxBalance) {
      query.creditBalance = {};
      if (minBalance) {
        query.creditBalance.$gte = minBalance;
      }
      if (maxBalance) {
        query.creditBalance.$lte = maxBalance;
      }
    }

    // Fetch customers based on the query
    const customers = await Customer.find(query)
    .populate("addedBy")
      .populate("shops")
      .populate("dailyItems.itemName")
      .lean()
      .exec();

    return res.status(200).json({
      resultMessage: getText("00089"), // Successfully retrieved customers
      resultCode: "00089",
      customers,
    });
  } catch (err) {
    console.error("Error fetching customers:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
  }
};