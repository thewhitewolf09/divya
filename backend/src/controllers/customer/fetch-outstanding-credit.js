import { Customer, Sale } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";


export default  async (req, res) => {
    const { id } = req.params;
  
    if (!id) {
      return res.status(400).json({
        resultMessage: getText("00022"), // Missing customer ID
        resultCode: "00022",
      });
    }
  
    try {
      // Check if the customer exists
      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({
          resultMessage: getText("00052"), // Customer not found
          resultCode: "00052",
        });
      }
  
      // Fetch outstanding credit transactions for the customer
      const outstandingCredits = await Sale.find({
        customerId: id,
        isCredit: true,
        "creditDetails.paymentStatus": { $in: ["pending", "partially_paid"] },
      });
  
      return res.status(200).json({
        resultMessage: getText("00089"), // Successfully retrieved outstanding credits
        resultCode: "00089",
        outstandingCredits,
      });
    } catch (err) {
      console.error("Error fetching outstanding credits:", err);
      return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
    }
  };