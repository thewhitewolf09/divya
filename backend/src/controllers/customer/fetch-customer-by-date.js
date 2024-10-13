import { Customer, Sale } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";


export default  async (req, res) => {
    const { startDate, endDate } = req.query;
  
    // Validate query parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        resultMessage: getText("00022"), // Missing required fields
        resultCode: "00022",
      });
    }
  
    try {
      // Build the query object
      let query = {
        registrationDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
  
      // Fetch customers based on the date range
      const customers = await Customer.find(query);
  
      return res.status(200).json({
        resultMessage: getText("00089"), // Successfully retrieved customers
        resultCode: "00089",
        customers,
      });
    } catch (err) {
      console.error("Error fetching customers by date range:", err);
      return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
    }
  };