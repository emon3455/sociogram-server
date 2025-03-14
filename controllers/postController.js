const Post = require("../models/postSchema");

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const post = new Post({ user: req.user.id, content, image });
    await post.save();
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

// Like or Unlike a post
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    const userIndex = post.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      post.likes.push(req.user.id);
      res.json({ message: "Post liked!" });
    } else {
      post.likes.splice(userIndex, 1);
      res.json({ message: "Like removed!" });
    }

    await post.save();
  } catch (error) {
    res.status(500).json({ error: "Error liking post" });
  }
};

// Comment on a post
exports.commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = { user: req.user.id, text };
    post.comments.push(comment);

    await post.save();
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

    post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);
    await post.save();

    res.json({ message: "Comment deleted!" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting comment" });
  }
};
