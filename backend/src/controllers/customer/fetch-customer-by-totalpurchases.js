/**
 * @swagger
 * /api/customers/filter/total-purchases:
 *   get:
 *     summary: Filter customers by total purchases range
 *     description: Filters customers based on their total purchases, allowing for a specified minimum and maximum range of purchases.
 *     tags:
 *       - Customer
 *     parameters:
 *       - name: minPurchases
 *         in: query
 *         required: false
 *         description: The minimum number of purchases. If specified, only customers with a `totalPurchases` greater than or equal to this value will be returned.
 *         schema:
 *           type: integer
 *           example: 5
 *       - name: maxPurchases
 *         in: query
 *         required: false
 *         description: The maximum number of purchases. If specified, only customers with a `totalPurchases` less than or equal to this value will be returned.
 *         schema:
 *           type: integer
 *           example: 50
 *     responses:
 *       200:
 *         description: Successfully retrieved customers based on the specified total purchases range.
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
 *                       totalPurchases:
 *                         type: integer
 *                         example: 10
 *       400:
 *         description: Invalid query parameters for `minPurchases` or `maxPurchases`. Both must be integers.
 *       500:
 *         description: Internal server error.
 */



import { Customer, Sale } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default  async (req, res) => {
    const { minPurchases, maxPurchases } = req.query;
  
    // Validate query parameters
    if (minPurchases && isNaN(minPurchases)) {
      return res.status(400).json({
        resultMessage: getText("00022"), // Invalid minPurchases
        resultCode: "00022",
      });
    }
    if (maxPurchases && isNaN(maxPurchases)) {
      return res.status(400).json({
        resultMessage: getText("00022"), // Invalid maxPurchases
        resultCode: "00022",
      });
    }
  
    try {
      // Build the query object
      let query = {};
  
      if (minPurchases || maxPurchases) {
        query.totalPurchases = {};
        if (minPurchases) {
          query.totalPurchases.$gte = Number(minPurchases);
        }
        if (maxPurchases) {
          query.totalPurchases.$lte = Number(maxPurchases);
        }
      }
  
      // Fetch customers based on the total purchases range
      const customers = await Customer.find(query);
  
      return res.status(200).json({
        resultMessage: getText("00089"), // Successfully retrieved customers
        resultCode: "00089",
        customers,
      });
    } catch (err) {
      console.error("Error fetching customers by total purchases:", err);
      return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
    }
  };