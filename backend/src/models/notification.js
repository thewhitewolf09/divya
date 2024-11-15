import mongoose from "mongoose";


const notificationSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      imageUrl: {
        type: String, // URL for the image
        required: false, // Optional field
      },
      recipientRole: {
        type: String,
        enum: ["shopOwner", "customer"],
        required: true,
      },
      recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "recipientRole",
        required: true,
      },
      isRead: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    { timestamps: true }
  );
  
  const Notification = mongoose.model("Notification", notificationSchema);
  
  export default Notification;
  