/**
 * @swagger
 * /api/products/add:
 *   post:
 *     summary: Create a new product
 *     description: Adds a new product to the inventory with optional variants.
 *     tags:
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product
 *                 example: "Sample Product"
 *               category:
 *                 type: string
 *                 description: Category of the product
 *                 example: "Electronics"
 *               price:
 *                 type: number
 *                 description: Price of the product
 *                 example: 1500
 *               stockQuantity:
 *                 type: number
 *                 description: Available stock quantity of the product
 *                 example: 50
 *               unit:
 *                 type: string
 *                 description: Unit of the product (e.g., "piece", "kg")
 *                 example: "piece"
 *               description:
 *                 type: string
 *                 description: Description of the product
 *                 example: "A high-quality sample product."
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variantName:
 *                       type: string
 *                       description: Name of the variant
 *                       example: "Variant 1"
 *                     variantPrice:
 *                       type: number
 *                       description: Price of the variant
 *                       example: 1200
 *                     variantStockQuantity:
 *                       type: number
 *                       description: Stock quantity of the variant
 *                       example: 25
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Product added successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Required fields are missing."
 *                 resultCode:
 *                   type: string
 *                   example: "00025"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "An error occurred."
 *                 resultCode:
 *                   type: string
 *                   example: "00090"
 */
import { Product, Customer, Notification } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";
import { sendPushNotification } from "../../utils/sendNotification.js";

export default async (req, res) => {
  const { name, category, price, stockQuantity, unit, description, variants } =
    req.body;
  const addedBy = req.user._id;

  // Validate required fields
  if (!name || !category || !price || stockQuantity === undefined) {
    console.log(req.body);
    return res.status(400).json({
      resultMessage:
        "Product creation failed. Name, category, price, and stock quantity are required fields.",
      resultCode: "40001", // Custom code for missing required fields
    });
  }

  // Format variants to match expected structure
  const formattedVariants = variants.map((variant) => ({
    variantName: variant.variantName || variant, // Use the variant name from the object or fallback to string
    variantPrice: variant.variantPrice || price, // Default to main price if not provided
    variantStockQuantity: variant.variantStockQuantity || stockQuantity, // Default to main stock if not provided
  }));

  try {
    // Create a new product with formatted variants
    const newProduct = new Product({
      name,
      category,
      price,
      stockQuantity,
      unit,
      description,
      variants: formattedVariants, // Use the formatted variants
      addedBy,
    });

    const savedProduct = await newProduct.save();

    // Notify customers about the new product
    const customers = await Customer.find({
      isActive: true,
      deviceToken: { $exists: true },
    });

    const deviceTokens = customers
      .map((customer) => customer.deviceToken)
      .filter(Boolean);

    const notificationPayload = {
      title: "New Product Added!",
      body: `Check out our new product: ${name} in the ${category} category.`,
      data: { productId: savedProduct._id, category },
      image: savedProduct.productImage,
    };

    if (deviceTokens.length > 0) {
      await sendPushNotification(deviceTokens, notificationPayload);
    } else {
      console.log("No customers with valid device tokens found.");
    }

    // Save notifications in the database
    const notificationPromises = customers.map((customer) =>
      Notification.create({
        title: notificationPayload.title,
        message: notificationPayload.body,
        imageUrl: notificationPayload.image, // Save image URL in the notification
        recipientRole: "customer",
        recipientId: customer._id,
      })
    );

    await Promise.all(notificationPromises);

    return res.status(201).json({
      resultMessage:
        "Product created successfully and notifications sent to active customers.",
      resultCode: "20101", // Custom code for successful product creation
      product: savedProduct,
    });
  } catch (err) {
    console.error("Error creating product:", err);
    return res.status(500).json({
      resultMessage: "An error occurred while creating the product.",
      resultCode: "50001", // Custom code for server error
      error: err.message,
    });
  }
};
