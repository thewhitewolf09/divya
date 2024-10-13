import { Customer, Sale } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default  async (req, res) => {
    const { name } = req.query;
  
    // Validate query parameter
    if (!name) {
      return res.status(400).json({
        resultMessage: getText("00022"), // Missing required query parameter
        resultCode: "00022",
      });
    }
  
    try {
      // Create regex pattern for case-insensitive search
      const regex = new RegExp(name, "i");
  
      // Fetch customers with names matching the query
      const customers = await Customer.find({ name: { $regex: regex } });
  
      return res.status(200).json({
        resultMessage: getText("00089"), // Successfully retrieved customers
        resultCode: "00089",
        customers,
      });
    } catch (err) {
      console.error("Error searching customers:", err);
      return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
    }
  };