import { Customer } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"), // Missing customer ID
      resultCode: "00022",
    });
  }

  try {
    // Fetch customer details
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

    // Check if the customer has daily items
    if (!customer.dailyItems || Object.keys(customer.dailyItems).length === 0) {
      return res.status(404).json({
        resultMessage: getText("00093"), // No daily items found for the customer
        resultCode: "00093",
      });
    }

    // Prepare attendance data
    const dailyItemAttendance = Object.entries(customer.dailyItems).map(
      ([itemName, itemData]) => ({
        itemName,
        quantityPerDay: itemData.quantityPerDay,
        attendance: Array.from(itemData.attendance.values()),
      })
    );

    return res.status(200).json({
      resultMessage: getText("00089"), // Successfully retrieved daily item attendance
      resultCode: "00089",
      dailyItemAttendance,
    });
  } catch (err) {
    console.error("Error fetching daily item attendance:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
  }
};
