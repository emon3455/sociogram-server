const Post = require("../models/postSchema");
const Notification = require("../models/notificationSchema");
const User = require("../models/userSchema");
const { io } = require("../index");

// Create Post with Notification
exports.createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const post = new Post({ user: req.user.id, content, image });
    await post.save();

    // Create Notification (optional: send to followers or friends)
    const notification = new Notification({
      user: req.user.id,
      type: "post",
      message: `${req.user.username} created a new post.`,
    });
    await notification.save();

    // Access io from app
    const io = req.app.get("io");
    if (io) {
      io.emit(`notification_${req.user.id}`, notification);
    }

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Error creating post" });
  }
};

// Get all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePicture") // Populate user details
      .populate("comments.user", "username profilePicture"); // Populate comments
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching posts" });
  }
};

// Like or Unlike a post with Notification
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate("user");

    if (!post) return res.status(404).json({ error: "Post not found" });

    const userIndex = post.likes.indexOf(req.user.id);
    let notification;

    if (userIndex === -1) {
      post.likes.push(req.user.id);

      // Create Notification
      notification = new Notification({
        user: post.user._id,
        type: "like",
        message: `${req.user.username} liked your post.`,
      });
    } else {
      post.likes.splice(userIndex, 1);
    }

    await post.save();

    if (notification) {
      await notification.save();
      const io = req.app.get("io");
      if (io) {
        io.emit(`notification_${post.user._id}`, notification);
      }
    }

    res.json({ message: userIndex === -1 ? "Post liked!" : "Like removed!" });
  } catch (error) {
    res.status(500).json({ error: "Error liking post" });
  }
};

// Comment on a post with Notification
exports.commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const post = await Post.findById(postId).populate("user");

    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = { user: req.user.id, text };
    post.comments.push(comment);
    await post.save();

    // Create Notification
    const notification = new Notification({
      user: post.user._id,
      type: "comment",
      message: `${req.user.username} commented on your post.`,
    });
    await notification.save();

    const io = req.app.get("io");
    if (io) {
      io.emit(`notification_${post.user._id}`, notification);
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Error commenting on post" });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments = post.comments.filter(
      (comment) => comment._id.toString() !== commentId
    );
    await post.save();

    res.json({ message: "Comment deleted!" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting comment" });
  }
};
