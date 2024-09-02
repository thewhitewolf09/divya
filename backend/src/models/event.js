import mongoose from "mongoose";
const { Schema, model } = mongoose;

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    eventLocation: {
      type: String,
      required: true,
    },
    eventDate: {
      type: String,
      required: true,
    },
    registrationFee: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    registeredAttendees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Event = model("Event", eventSchema);
export default Event;
