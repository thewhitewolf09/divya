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