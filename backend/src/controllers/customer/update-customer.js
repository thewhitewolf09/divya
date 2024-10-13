import { Customer } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const userId = req.user._id;

  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"), // Missing customer ID
      resultCode: "00022",
    });
  }

  try {
    // Find the customer by ID
    const customer = await Customer.findById(id)
      .populate("addedBy")
      .populate({
        path: "dailyItems.itemName",
      })
      .populate("shops");

    if (!customer) {
      return res.status(404).json({
        resultMessage: getText("00052"), // Customer not found
        resultCode: "00052",
      });
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        customer[key] = updates[key];
      }
    });

    // Save the updated customer
    const updatedCustomer = await customer.save();

    return res.status(200).json({
      resultMessage: getText("00089"), // Customer updated successfully
      resultCode: "00089",
      customer: updatedCustomer,
    });
  } catch (err) {
    console.error("Error updating customer details:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
  }
};
