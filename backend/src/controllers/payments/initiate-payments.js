/**
 * @swagger
 * /api/payments/initiate:
 *   post:
 *     summary: Initiates a payment for an order
 *     description: This endpoint processes the payment for a given order and updates the order and payment status accordingly.
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: The order ID, customer ID, and payment method to process the payment.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The ID of the order for which payment is being processed.
 *               customerId:
 *                 type: string
 *                 description: The ID of the customer making the payment.
 *               paymentMethod:
 *                 type: string
 *                 enum: [creditCard, debitCard, paypal, bankTransfer]
 *                 description: The payment method chosen for the transaction.
 *             required:
 *               - orderId
 *               - customerId
 *               - paymentMethod
 *     responses:
 *       200:
 *         description: Payment successfully processed and order updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: The message indicating the result of the operation.
 *                 resultCode:
 *                   type: string
 *                   description: The result code indicating the success of the operation.
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Payment processing failed or order is not in a valid state.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                 resultCode:
 *                   type: string
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Order or cart not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                 resultCode:
 *                   type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                 resultCode:
 *                   type: string
 *                 error:
 *                   type: string
 *     components:
 *       schemas:
 *         Payment:
 *           type: object
 *           properties:
 *             orderId:
 *               type: string
 *             customerId:
 *               type: string
 *             amount:
 *               type: number
 *               format: float
 *             method:
 *               type: string
 *             status:
 *               type: string
 *             transactionId:
 *               type: string
 *         Order:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             status:
 *               type: string
 *             totalAmount:
 *               type: number
 *               format: float
 *             products:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productId:
 *                     type: string
 *                   quantity:
 *                     type: number
 *             payment:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 transactionId:
 *                   type: string
 */

import { Cart, Order, Payment, Sale, Customer } from "../../models/index.js";
import { errorHelper, getText, paymentGateway } from "../../utils/index.js";

export default async (req, res) => {
  const { orderId, customerId, paymentMethod } = req.body;

  try {
    const order = await Order.findById(orderId).populate("products.productId");

    if (!order) {
      return res.status(404).json({
        resultMessage: getText("00030"),
        resultCode: "00030",
      });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({
        resultMessage: getText("00095"),
        resultCode: "00095",
      });
    }

    const cart = await Cart.findOne({ customerId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({
        resultMessage: getText("00028"),
        resultCode: "00028",
      });
    }

    const amount = order.totalAmount;
    const paymentResponse = await paymentGateway.processPayment({
      amount,
      method: paymentMethod,
      customerId,
      orderId,
    });

    if (paymentResponse.success) {
      const transactionId = paymentResponse.transactionId;

      const newPayment = new Payment({
        orderId,
        customerId,
        amount,
        method: paymentMethod,
        status: "Success",
        transactionId,
      });

      await newPayment.save();

      order.status = "Order Placed";
      order.payment.status = "Success";
      order.payment.transactionId = transactionId;

      let totalPurchaseAmount = 0;

      const salePromises = order.products.map(async (product, index) => {
        const discountedPrice = product.productId.discount
          ? parseFloat(
              (
                product.productId.price *
                (1 - product.productId.discount / 100)
              ).toFixed(2)
            )
          : product.productId.price.toFixed(2);

        const newSale = new Sale({
          productId: product.productId._id,
          quantity: product.quantity,
          price: discountedPrice,
          date: new Date(),
          customerId,
          saleType: "normal",
          isCredit: false,
          creditDetails: {
            amountOwed: 0,
            paymentStatus: "paid",
          },
        });

        const savedSale = await newSale.save();
        order.products[index].saleId = savedSale._id;

        // Calculate total purchase amount for this sale
        totalPurchaseAmount += discountedPrice * product.quantity;
      });

      await Promise.all(salePromises);
      await order.save();

      // Update customer totalPurchases
      const customer = await Customer.findById(customerId);
      if (customer) {
        customer.totalPurchases += totalPurchaseAmount;
        await customer.save();
      }

      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();

      return res.status(200).json({
        resultMessage: getText("00096"),
        resultCode: "00096",
        payment: newPayment,
        order,
      });
    } else {
      const transactionId = paymentResponse.transactionId;

      const failedPayment = new Payment({
        orderId,
        customerId,
        amount,
        method: paymentMethod,
        status: "Failed",
        transactionId,
      });

      order.payment.status = "Failed";
      order.payment.transactionId = transactionId;
      await order.save();
      await failedPayment.save();

      return res.status(400).json({
        resultMessage: getText("00097"),
        resultCode: "00097",
        payment: failedPayment,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
