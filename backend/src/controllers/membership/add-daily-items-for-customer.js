import { Customer, Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const { itemName, quantityPerDay } = req.body;

  if (!id || !itemName || quantityPerDay === undefined) {
    return res.status(400).json({
      resultMessage: getText("00022"), // Missing required fields
      resultCode: "00022",
    });
  }

  try {
    // Find the customer
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

    // Initialize dailyItems if it's undefined
    if (!Array.isArray(customer.dailyItems)) {
      customer.dailyItems = [];
    }

    // Find the product by itemName to get its price
    const product = await Product.findOne({ name: itemName });
    if (!product) {
      return res.status(404).json({
        resultMessage: getText("00093"), // Product not found
        resultCode: "00093",
      });
    }

    // Create the daily item entry
    const dailyItem = {
      itemName,
      quantityPerDay,
      attendance: [
        {
          date: new Date(),
          quantity: quantityPerDay,
          price: product.price,
          taken: false,
        },
      ],
    };

    // Check if the daily item already exists
    const existingItem = customer.dailyItems.find(
      (item) => item.itemName === itemName
    );

    if (existingItem) {
      return res.status(400).json({
        resultMessage: getText("00022"), // Item already exists
        resultCode: "00022",
      });
    }

    // Add the new daily item to the customer's record
    customer.dailyItems.push(dailyItem);

    const updatedCustomer = await customer.save();

    return res.status(201).json({
      resultMessage: getText("00089"), // Successfully added daily item
      resultCode: "00089",
      customer: updatedCustomer,
    });
  } catch (err) {
    console.log("Error adding daily item for customer:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
  }
};
