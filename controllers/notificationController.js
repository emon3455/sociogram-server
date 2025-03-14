const Notification = require("../models/notificationSchema");

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 }); // Show latest notifications first

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
};

// Mark a notification as seen
exports.markNotificationAsSeen = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) return res.status(404).json({ error: "Notification not found" });

    // Update the notification status
    notification.seen = true;
    await notification.save();

    res.json({ message: "Notification marked as seen", notification });
  } catch (error) {
    res.status(500).json({ error: "Error marking notification as seen" });
  }
};
