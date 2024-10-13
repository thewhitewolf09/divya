import { Customer } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;

  // Validate the ID
  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00025"),
      resultCode: "00025",
    });
  }

  try {
    // Fetch customer details from the database
    const customer = await Customer.findById(id)
      .exec()
      .populate("addedBy")
      .populate({
        path: "dailyItems.itemName",
      })
      .populate("shops");

    if (!customer) {
      return res.status(404).json({
        resultMessage: getText("00026"),
        resultCode: "00026",
      });
    }

    // Respond with customer details
    return res.status(200).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      customer,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
