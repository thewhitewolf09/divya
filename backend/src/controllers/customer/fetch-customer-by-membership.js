/**
 * @swagger
 * /api/customers/filter/membership-status:
 *   get:
 *     summary: Filter customers by membership status
 *     description: Filters customers based on their membership status, where the status can be either `active` or `inactive`.
 *     tags:
 *       - Customer
 *     parameters:
 *       - name: membershipStatus
 *         in: query
 *         required: true
 *         description: The membership status of the customer. It can either be `active` or `inactive`.
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *           example: "active"
 *     responses:
 *       200:
 *         description: Successfully retrieved customers based on the specified membership status.
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
 *                       membershipStatus:
 *                         type: string
 *                         enum: [active, inactive]
 *                         example: "active"
 *       400:
 *         description: Invalid or missing `membershipStatus` query parameter. The status must be either `active` or `inactive`.
 *       500:
 *         description: Internal server error.
 */


import { Customer, Sale } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default  async (req, res) => {
    const { membershipStatus } = req.query;
  
    // Validate query parameter
    if (!membershipStatus || !["active", "inactive"].includes(membershipStatus)) {
      return res.status(400).json({
        resultMessage: getText("00022"), // Invalid or missing membershipStatus
        resultCode: "00022",
      });
    }
  
    try {
      // Build the query object
      let query = {
        membershipStatus,
      };
  
      // Fetch customers based on the membership status
      const customers = await Customer.find(query);
  
      return res.status(200).json({
        resultMessage: getText("00089"), // Successfully retrieved customers
        resultCode: "00089",
        customers,
      });
    } catch (err) {
      console.error("Error fetching customers by membership status:", err);
      return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
    }
  };