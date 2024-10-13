import { Customer, Sale } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default  async (req, res) => {
  const {
    name,
    startDate,
    endDate,
    membershipStatus,
    minPurchases,
    maxPurchases,
    minBalance,
    maxBalance,
  } = req.query;

  try {
    // Build the query object
    let query = {};

    if (name) {
      query.name = { $regex: new RegExp(name, "i") }; // Case-insensitive search
    }

    if (startDate || endDate) {
      query.registrationDate = {};
      if (startDate) {
        query.registrationDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.registrationDate.$lte = new Date(endDate);
      }
    }

    if (membershipStatus) {
      query.membershipStatus = membershipStatus;
    }

    if (minPurchases || maxPurchases) {
      query.totalPurchases = {};
      if (minPurchases) {
        query.totalPurchases.$gte = minPurchases;
      }
      if (maxPurchases) {
        query.totalPurchases.$lte = maxPurchases;
      }
    }

    if (minBalance || maxBalance) {
      query.creditBalance = {};
      if (minBalance) {
        query.creditBalance.$gte = minBalance;
      }
      if (maxBalance) {
        query.creditBalance.$lte = maxBalance;
      }
    }

    // Fetch customers based on the query
    const customers = await Customer.find(query);

    return res.status(200).json({
      resultMessage: getText("00089"), // Successfully retrieved customers
      resultCode: "00089",
      customers,
    });
  } catch (err) {
    console.error("Error fetching customers:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
  }
};













