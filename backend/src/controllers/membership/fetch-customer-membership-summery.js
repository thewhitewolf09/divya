import { Customer, Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const { month, year } = req.query;

  if (!id || !month || !year) {
    return res.status(400).json({
      resultMessage: getText("00022"), // Missing required fields
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

    // Ensure month is a number and between 1 and 12
    const monthNumber = parseInt(month, 10);
    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return res.status(400).json({
        resultMessage: getText("00022"), // Invalid month
        resultCode: "00022",
      });
    }

    // Define the start and end of the month
    const startDate = new Date(year, monthNumber - 1, 1);
    const endDate = new Date(year, monthNumber, 0); // Last day of the month

    let totalFee = 0;

    // Iterate over daily items and calculate the total fee
    for (const [itemName, itemDetails] of Object.entries(customer.dailyItems)) {
      if (itemDetails.attendance) {
        // Fetch the product details to get the price
        const product = await Product.findOne({ name: itemName });
        if (product) {
          const price = product.price;

          // Sum up the total fee for the month
          for (const [date, record] of Object.entries(itemDetails.attendance)) {
            const recordDate = new Date(date);
            if (recordDate >= startDate && recordDate <= endDate) {
              totalFee += record.quantity * price;
            }
          }
        }
      }
    }

    return res.status(200).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      totalFee,
    });
  } catch (err) {
    console.error("Error fetching membership summary:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
  }
};
