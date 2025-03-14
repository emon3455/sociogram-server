const User = require("../models/userSchema");
const Notification = require("../models/notificationSchema");
const { io } = require("../index");

// Send Friend Request with Notification
exports.sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const sender = await User.findById(req.user.id);
    const receiver = await User.findById(receiverId);

    if (!receiver) return res.status(404).json({ error: "User not found" });

    if (
      receiver.friendRequests.includes(sender._id) ||
      receiver.friends.includes(sender._id)
    ) {
      return res
        .status(400)
        .json({ error: "Request already sent or already friends" });
    }

    receiver.friendRequests.push(sender._id);
    await receiver.save();

    // Create Notification
    const notification = new Notification({
      user: receiver._id,
      type: "friend_request",
      message: `${sender.username} sent you a friend request.`,
    });
    await notification.save();

    const io = req.app.get("io");
    if (io) {
      io.emit(`notification_${receiver._id}`, notification);
    }

    res.json({ message: "Friend request sent!" });
  } catch (error) {
    res.status(500).json({ error: "Error sending friend request" });
  }
};
// Accept Friend Request with Notification
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const sender = await User.findById(senderId);
    const receiver = await User.findById(req.user.id);

    if (!sender || !receiver)
      return res.status(404).json({ error: "User not found" });

    if (!receiver.friendRequests.includes(sender._id)) {
      return res.status(400).json({ error: "No friend request found" });
    }

    receiver.friends.push(sender._id);
    sender.friends.push(receiver._id);
    receiver.friendRequests = receiver.friendRequests.filter(
      (id) => id.toString() !== senderId
    );

    await sender.save();
    await receiver.save();

    // Create Notification
    const notification = new Notification({
      user: sender._id,
      type: "friend_request",
      message: `${receiver.username} accepted your friend request.`,
    });
    await notification.save();

    const io = req.app.get("io");
    if (io) {
      io.emit(`notification_${receiver._id}`, notification);
    }

    res.json({ message: "Friend request accepted!" });
  } catch (error) {
    res.status(500).json({ error: "Error accepting friend request" });
  }
};

// Get Friends List
exports.getFriendsList = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "friends",
      "username profilePicture"
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ error: "Error fetching friends list" });
  }
};
