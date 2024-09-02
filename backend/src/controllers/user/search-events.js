import { Event } from "../../models/index.js";

export default async (req, res) => {
  const { searchQuery } = req.params;

  if (!searchQuery || searchQuery.trim() === "") {
    return res.status(400).json({ message: "Search query cannot be empty" });
  }

  try {
    const events = await Event.find({
      title: { $regex: `^${searchQuery}`, $options: "i" }, // Anchoring to the start of the string
    }).sort({ updatedAt: -1 });

    if (events.length === 0) {
      return res.status(404).json({ message: "No events found for this search query" });
    }

    return res.status(200).json({ events });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching events" });
  }
};
