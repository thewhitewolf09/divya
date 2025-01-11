/**
 * @swagger
 * /api/payments/receipt/{transactionId}:
 *   get:
 *     summary: Generate and download payment receipt
 *     description: This endpoint generates a PDF receipt for the payment associated with the provided transaction ID and the authenticated customer.
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         description: The transaction ID for which the receipt is generated.
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment receipt PDF generated successfully.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Payment receipt not found for the provided transaction ID.
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
 */



import { Payment } from "../../models/index.js"; // Import Payment model
import { errorHelper } from "../../utils/index.js";
import pdf from "pdfkit"; // PDF generation package (or any other PDF generator)

export default async (req, res) => {
  const { transactionId } = req.params; // Get transaction ID from the URL parameters
  const customerId = req.user._id; // Assuming customer ID is retrieved from authenticated session

  try {
    // Find the payment by transaction ID and ensure it belongs to the current customer
    const payment = await Payment.findOne({ transactionId, customerId });

    if (!payment) {
      return res.status(404).json({
        resultMessage: "Payment receipt not found.",
        resultCode: "40401", // Custom error code for payment not found
      });
    }

    // Generate a receipt (PDF in this case) using pdfkit or any other library
    const doc = new pdf();

    // Set headers to trigger file download
    res.setHeader("Content-Disposition", `attachment; filename=receipt_${transactionId}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    // Pipe the PDF stream to the response
    doc.pipe(res);

    // Build PDF content (Example: You can customize this to match your receipt format)
    doc.fontSize(20).text("Payment Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Transaction ID: ${payment.transactionId}`);
    doc.text(`Order ID: ${payment.orderId}`);
    doc.text(`Customer ID: ${payment.customerId}`);
    doc.text(`Amount Paid: ₹${payment.amount}`);
    doc.text(`Payment Method: ${payment.method}`);
    doc.text(`Payment Status: ${payment.status}`);
    doc.text(`Date: ${payment.createdAt}`);

    doc.moveDown();
    doc.fontSize(10).text("Thank you for your payment!", { align: "center" });

    // End the PDF generation and send the response
    doc.end();

  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("50001", req, err.message)); // Custom error code for server errors
  }
};
