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