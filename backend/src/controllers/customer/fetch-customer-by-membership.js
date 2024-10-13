import { Customer, Sale } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default  async (req, res) => {
    const { membershipStatus } = req.query;
  
    // Validate query parameter
    if (!membershipStatus || !["active", "inactive"].includes(membershipStatus)) {
      return res.status(400).json({
        resultMessage: getText("00022"), // Invalid or missing membershipStatus
        resultCode: "00022",
      });
    }
  
    try {
      // Build the query object
      let query = {
        membershipStatus,
      };
  
      // Fetch customers based on the membership status
      const customers = await Customer.find(query);
  
      return res.status(200).json({
        resultMessage: getText("00089"), // Successfully retrieved customers
        resultCode: "00089",
        customers,
      });
    } catch (err) {
      console.error("Error fetching customers by membership status:", err);
      return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
    }
  };