/**
 * @swagger
 * /api/products/bulk:
 *   patch:
 *     summary: Bulk update multiple products
 *     description: Update multiple products in bulk by providing an array of updates with product IDs and the fields to be updated.
 *     tags:
 *       - Product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The product ID to update
 *                 name:
 *                   type: string
 *                   description: The name of the product (optional)
 *                 price:
 *                   type: number
 *                   description: The price of the product (optional)
 *                 stockStatus:
 *                   type: string
 *                   description: The stock status (optional)
 *                 active:
 *                   type: boolean
 *                   description: Whether the product is active (optional)
 *                 discounted:
 *                   type: boolean
 *                   description: Whether the product is discounted (optional)
 *     responses:
 *       200:
 *         description: Bulk update completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Bulk update completed."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 successes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       success:
 *                         type: boolean
 *                       message:
 *                         type: string
 *                       example:
 *                         _id: "605c72ef1532071eec9b68c1"
 *                         success: true
 *                         message: "Product updated successfully."
 *                 failures:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       success:
 *                         type: boolean
 *                       message:
 *                         type: string
 *                       example:
 *                         _id: "605c72ef1532071eec9b68c2"
 *                         success: false
 *                         message: "Product not found."
 *       400:
 *         description: Invalid update data provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Invalid update data provided."
 *                 resultCode:
 *                   type: string
 *                   example: "00022"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "An error occurred."
 *                 resultCode:
 *                   type: string
 *                   example: "00090"
 */

import { Product } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

// Bulk Update Products API
export default async (req, res) => {
  const updates = req.body; // Expecting an array of update objects

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({
      resultMessage:
        "Invalid update data provided. Ensure you send an array of product updates.",
      resultCode: "40001", // Custom code for invalid input
    });
  }

  try {
    // Create an array of update promises
    const updatePromises = updates.map(async (update) => {
      const { _id, ...updateFields } = update;

      if (!_id || Object.keys(updateFields).length === 0) {
        return {
          _id,
          success: false,
          message:
            "Invalid data for product update. Ensure the product ID and at least one field to update are provided.",
        };
      }

      try {
        const product = await Product.findById(_id);
        if (!product) {
          return {
            _id,
            success: false,
            message: "Product not found for the provided ID.",
          };
        }

        // Update the product fields
        Object.keys(updateFields).forEach((key) => {
          if (updateFields[key] !== undefined) {
            product[key] = updateFields[key];
          }
        });

        await product.save();

        return {
          _id,
          success: true,
          message: "Product updated successfully.",
        };
      } catch (err) {
        console.error(`Error updating product with ID ${_id}:`, err);
        return {
          _id,
          success: false,
          message: "An error occurred while updating the product.",
        };
      }
    });

    // Wait for all update promises to complete
    const results = await Promise.all(updatePromises);

    // Separate successful and failed updates
    const successes = results.filter((result) => result.success);
    const failures = results.filter((result) => !result.success);

    return res.status(200).json({
      resultMessage: "Bulk update completed. Review successes and failures.",
      resultCode: "20001", // Custom code for successful bulk update
      successes,
      failures,
    });
  } catch (err) {
    console.error("Error in bulk update operation:", err);
    return res.status(500).json({
      resultMessage:
        "An internal server error occurred during the bulk update operation.",
      resultCode: "50001", // Custom code for server error
      error: err.message,
    });
  }
};
