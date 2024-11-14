/**
 * @swagger
 * /api/customers/{id}/daily-items/{itemName}/attendance:
 *   post:
 *     summary: Record attendance for a daily item and update customer purchase details
 *     description: Records attendance for a specific daily item for a customer and updates their total purchases and credit balance. A sale record is created if the quantity is greater than 0.
 *     tags:
 *       - Membership
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the customer whose daily item attendance is being recorded.
 *         schema:
 *           type: string
 *           example: "60d5f7f3b6b8f62b8b9f3c6d"
 *       - name: itemName
 *         in: path
 *         required: true
 *         description: The name of the daily item for which attendance is being recorded.
 *         schema:
 *           type: string
 *           example: "Item A"
 *       - name: date
 *         in: body
 *         required: true
 *         description: The date of attendance.
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-11-13"
 *       - name: quantity
 *         in: body
 *         required: true
 *         description: The quantity for the daily item.
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Successfully recorded attendance and updated customer details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Successfully recorded attendance and updated sale."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 customer:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d5f7f3b6b8f62b8b9f3c6d"
 *                     dailyItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           itemName:
 *                             type: string
 *                             example: "Item A"
 *                           attendance:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 date:
 *                                   type: string
 *                                   example: "2024-11-13"
 *                                 quantity:
 *                                   type: integer
 *                                   example: 5
 *                                 price:
 *                                   type: number
 *                                   format: float
 *                                   example: 100
 *                                 taken:
 *                                   type: boolean
 *                                   example: true
 *       400:
 *         description: Missing required fields (customer ID, item name, date, or quantity).
 *       404:
 *         description: Customer or daily item not found.
 *       500:
 *         description: Internal server error.
 */



import { Customer, Product, Sale } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id, itemName } = req.params;
  const { date, quantity } = req.body;

  // Validate input
  if (!id || !itemName || !date || quantity === undefined) {
    return res.status(400).json({
      resultMessage: getText("00022"), // Missing required fields
      resultCode: "00022",
    });
  }

  try {
    // Fetch customer details
    const customer = await Customer.findById(id)
      .populate("addedBy")
      .populate("shops")
      .populate("dailyItems.itemName")
      .exec();

    // Check if customer exists
    if (!customer) {
      return res.status(404).json({
        resultMessage: getText("00052"), // Customer not found
        resultCode: "00052",
      });
    }

    // Check if the item exists in dailyItems
    const dailyItem = customer.dailyItems.find(
      (item) => item.itemName.name === itemName
    );

    if (!dailyItem) {
      return res.status(404).json({
        resultMessage: getText("00093"), // Daily item not found
        resultCode: "00093",
      });
    }

    // Fetch the price of the item from the Product model
    const product = await Product.findOne({ name: itemName });
    if (!product) {
      return res.status(404).json({
        resultMessage: getText("00093"), // Product not found
        resultCode: "00093",
      });
    }

    const price = product.price; // Get the price from the Product model

    // Record attendance for the specific day
    const attendanceDate = new Date(date).toISOString().split("T")[0]; // Ensure only the date part is used


    // Check if the attendance for this date is already marked
    const existingAttendanceIndex = dailyItem.attendance.findIndex(
      (att) => new Date(att.date).toISOString().split("T")[0] === attendanceDate
    );


    if (existingAttendanceIndex !== -1) {
      // If the attendance is already taken, throw an error
      if (dailyItem.attendance[existingAttendanceIndex].taken) {
        return res.status(400).json({
          resultMessage: getText("00094"), // Attendance already marked for this date
          resultCode: "00094",
        });
      }

      // Update existing attendance record (if taken is false)
      dailyItem.attendance[existingAttendanceIndex].quantity = quantity;
      dailyItem.attendance[existingAttendanceIndex].price = price;
      dailyItem.attendance[existingAttendanceIndex].taken = quantity > 0; // Mark as taken if quantity is greater than 0
    } else {
      // If no existing attendance, add a new attendance record
      dailyItem.attendance.push({
        date: attendanceDate,
        quantity,
        price,
        taken: quantity > 0,
      });
    }

    // Update totalPurchases and creditBalance
    const totalPrice = parseFloat((price * quantity).toFixed(2));
    customer.totalPurchases += totalPrice;
    customer.creditBalance += totalPrice;

    await customer.save(); // Save customer after modifying totals

    // Create a new sale record if the quantity is greater than 0
    if (quantity > 0) {
      const sale = new Sale({
        productId: product._id,
        quantity: quantity,
        price: price,
        customerId: customer._id,
        saleType: "membership",
        isCredit: true,
        creditDetails: {
          amountOwed: totalPrice,
          paymentStatus: "pending",
        },
      });

      await sale.save(); // Save the sale record
    }

    return res.status(200).json({
      resultMessage: getText("00089"), // Successfully recorded attendance and updated sale
      resultCode: "00089",
      customer,
    });
  } catch (err) {
    console.error("Error recording daily item attendance:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
  }
};
