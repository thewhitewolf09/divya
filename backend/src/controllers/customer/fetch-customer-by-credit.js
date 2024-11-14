/**
 * @swagger
 * /api/customers/filter/credit-balance:
 *   get:
 *     summary: Filter customers by credit balance range
 *     description: Filters customers based on their credit balance, allowing for a specified minimum and maximum range of balances.
 *     tags:
 *       - Customer
 *     parameters:
 *       - name: minBalance
 *         in: query
 *         required: false
 *         description: The minimum credit balance. If specified, only customers with a `creditBalance` greater than or equal to this value will be returned.
 *         schema:
 *           type: integer
 *           example: 1000
 *       - name: maxBalance
 *         in: query
 *         required: false
 *         description: The maximum credit balance. If specified, only customers with a `creditBalance` less than or equal to this value will be returned.
 *         schema:
 *           type: integer
 *           example: 5000
 *     responses:
 *       200:
 *         description: Successfully retrieved customers based on the specified credit balance range.
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
 *                         example: "Jane Doe"
 *                       mobile:
 *                         type: string
 *                         example: "9876543210"
 *                       creditBalance:
 *                         type: integer
 *                         example: 2500
 *       400:
 *         description: Invalid query parameters for `minBalance` or `maxBalance`. Both must be integers.
 *       500:
 *         description: Internal server error.
 */



import { Customer, Sale } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default  async (req, res) => {
    const { minBalance, maxBalance } = req.query;
  
    // Validate query parameters
    if (minBalance && isNaN(minBalance)) {
      return res.status(400).json({
        resultMessage: getText("00022"), // Invalid minBalance
        resultCode: "00022",
      });
    }
    if (maxBalance && isNaN(maxBalance)) {
      return res.status(400).json({
        resultMessage: getText("00022"), // Invalid maxBalance
        resultCode: "00022",
      });
    }
  
    try {
      // Build the query object
      let query = {};
  
      if (minBalance || maxBalance) {
        query.creditBalance = {};
        if (minBalance) {
          query.creditBalance.$gte = Number(minBalance);
        }
        if (maxBalance) {
          query.creditBalance.$lte = Number(maxBalance);
        }
      }
  
      // Fetch customers based on the credit balance range
      const customers = await Customer.find(query);
  
      return res.status(200).json({
        resultMessage: getText("00089"), // Successfully retrieved customers
        resultCode: "00089",
        customers,
      });
    } catch (err) {
      console.error("Error fetching customers by credit balance:", err);
      return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
    }
  };