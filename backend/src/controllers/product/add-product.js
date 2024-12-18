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
import { errorHelper, getText } from "../../utils/index.js";
import { sendPushNotification } from "../../utils/sendNotification.js";

export default async (req, res) => {
  const { name, category, price, stockQuantity, unit, description, variants } =
    req.body;
  const addedBy = req.user._id;

  // Validate required fields
  if (!name || !category || !price || stockQuantity === undefined) {
    console.log(req.body);
    return res.status(400).json({
      resultMessage: getText("00025"),
      resultCode: "00025",
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
      resultMessage: getText("00089"),
      resultCode: "00089",
      product: savedProduct,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
