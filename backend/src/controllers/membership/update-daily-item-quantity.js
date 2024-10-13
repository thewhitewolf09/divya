import { Customer } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id, itemName } = req.params;
  const { quantity } = req.body;

  if (!id || !itemName || quantity === undefined) {
    return res.status(400).json({
      resultMessage: getText("00022"), // Missing required fields
      resultCode: "00022",
    });
  }

  try {
    // Fetch customer details
    const customer = await Customer.findById(id).populate("addedBy")
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

    // Check if the item exists in dailyItems
    const item = customer.dailyItems[itemName];
    if (!item) {
      return res.status(404).json({
        resultMessage: getText("00093"), // Daily item not found
        resultCode: "00093",
      });
    }

    // Update the quantity for the specific daily item
    item.quantityPerDay = quantity;

    // Save the updated customer record
    const updatedCustomer = await customer.save();

    return res.status(200).json({
      resultMessage: getText("00089"), // Successfully updated item quantity
      resultCode: "00089",
      customer: updatedCustomer,
    });
  } catch (err) {
    console.error("Error updating daily item quantity:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
  }
};
