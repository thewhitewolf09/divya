/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user details
 *     description: Updates user information including name, mobile, and shop location details if provided.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID to update
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: true
 *         description: Fields to update for the user
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Updated name of the user
 *             mobile:
 *               type: string
 *               description: Updated mobile number of the user
 *             shopLocation:
 *               type: object
 *               description: Updated shop location details if applicable
 *               properties:
 *                 street:
 *                   type: string
 *                   description: Street address of the shop
 *                 city:
 *                   type: string
 *                   description: City where the shop is located
 *                 state:
 *                   type: string
 *                   description: State where the shop is located
 *                 postalCode:
 *                   type: string
 *                   description: Postal code of the shop's location
 *                 country:
 *                   type: string
 *                   description: Country where the shop is located
 *                 latitude:
 *                   type: number
 *                   description: Latitude coordinates of the shop
 *                 longitude:
 *                   type: number
 *                   description: Longitude coordinates of the shop
 *     responses:
 *       200:
 *         description: Successfully updated user details
 *         schema:
 *           type: object
 *           properties:
 *             resultMessage:
 *               type: string
 *               description: Success message
 *             resultCode:
 *               type: string
 *               description: Success code identifier
 *             user:
 *               type: object
 *               description: Updated user details
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Name of the user
 *                 mobile:
 *                   type: string
 *                   description: Mobile number of the user
 *                 shopLocation:
 *                   type: object
 *                   description: Shop location details
 *                   properties:
 *                     street:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     postalCode:
 *                       type: string
 *                     country:
 *                       type: string
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *       400:
 *         description: Bad request, validation error
 *         schema:
 *           type: object
 *           properties:
 *             resultMessage:
 *               type: string
 *               description: Error message indicating validation failure
 *             resultCode:
 *               type: string
 *       404:
 *         description: User not found
 *         schema:
 *           type: object
 *           properties:
 *             resultMessage:
 *               type: string
 *               description: Error message indicating user not found
 *             resultCode:
 *               type: string
 *       500:
 *         description: Internal server error
 *         schema:
 *           type: object
 *           properties:
 *             resultMessage:
 *               type: string
 *               description: Error message indicating server issue
 *             resultCode:
 *               type: string
 */



import { User } from "../../models/index.js";
import { validateEditUser } from "../../validators/user.validator.js";
import { errorHelper, logger, getText } from "../../utils/index.js";

export default async (req, res) => {
  // Validate request body
  const { error } = validateEditUser(req.body);
  
  if (error) {
    let code = "00077";
    const message = error.details[0].message;
    return res.status(400).json(errorHelper(code, req, message));
  }

  // Find user by ID
  const user = await User.findById(req.params.id).catch((err) => {
    return res.status(500).json(errorHelper("00082", req, err.message));
  });
  if (!user) {
    return res.status(404).json(errorHelper("00087", req, "User not found"));
  }

  // Update user details
  if (req.body.name) user.name = req.body.name;
  if (req.body.mobile) user.mobile = req.body.mobile;

  // Update shopLocation if present in the request
  if (req.body.shopLocation) {
    const { street, city, state, postalCode, country, latitude, longitude } = req.body.shopLocation;

    if (street) user.shopLocation.street = street;
    if (city) user.shopLocation.city = city;
    if (state) user.shopLocation.state = state;
    if (postalCode) user.shopLocation.postalCode = postalCode;
    if (country) user.shopLocation.country = country;
    if (latitude && longitude) {
      user.shopLocation.latitude = latitude;
      user.shopLocation.longitude = longitude;
    }
  }

  // Save the updated user/shop details
  await user.save().catch((err) => {
    return res.status(500).json(errorHelper("00085", req, err.message));
  });

  // Return success response
  logger("00086", req.user._id, getText("00086"), "Info", req);
  return res.status(200).json({
    resultMessage: getText("00086"),
    resultCode: "00086",
    user,
  });
};
