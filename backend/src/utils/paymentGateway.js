const paymentGateway = {
  processPayment: async ({ amount, method, customerId, orderId }) => {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock payment gateway response logic
    const success = Math.random() > 0.005; // 99.5% chance of success, 0.5% chance of failure
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    if (success) {
      // Simulating a successful payment response
      return {
        success: true,
        transactionId,
        message: "Payment processed successfully",
      };
    } else {
      // Simulating a failed payment response
      return {
        success: false,
        transactionId,
        message: "Payment failed",
      };
    }
  },
};

export default paymentGateway;
