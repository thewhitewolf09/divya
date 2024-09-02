import mongoose from 'mongoose';
import { Event } from "../../models/index.js";
import { User } from '../../models/index.js';

export default async (req, res) => {
  // console.log("What")
  const userId = req.user._id;
  const user = await User.findById({ _id: userId });
  console.log(userId)
  console.log(user)
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }
  try {
    const events = await Event.find({ registeredAttendees: userId }).sort({ updatedAt: -1 });
    console.log(events)
    return res.status(200).json({
      events
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error" })
  }
};

