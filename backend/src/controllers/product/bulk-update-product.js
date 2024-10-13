import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

// Bulk Update Products API
export default async (req, res) => {
  const updates = req.body; // Expecting an array of update objects

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "Invalid update data provided."
      resultCode: "00022",
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
          message: "Invalid data for product update."
        };
      }

      try {
        const product = await Product.findById(_id);
        if (!product) {
          return {
            _id,
            success: false,
            message: "Product not found."
          };
        }

        // Update the product fields
        Object.keys(updateFields).forEach(key => {
          if (updateFields[key] !== undefined) {
            product[key] = updateFields[key];
          }
        });

        await product.save();

        return {
          _id,
          success: true,
          message: "Product updated successfully."
        };
      } catch (err) {
        console.error(err);
        return {
          _id,
          success: false,
          message: "Failed to update product."
        };
      }
    });

    // Wait for all update promises to complete
    const results = await Promise.all(updatePromises);

    // Separate successful and failed updates
    const successes = results.filter(result => result.success);
    const failures = results.filter(result => !result.success);

    return res.status(200).json({
      resultMessage: getText("00089"), // "Bulk update completed."
      resultCode: "00089",
      successes,
      failures
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};

 
