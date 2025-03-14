const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createPost, getPosts, likePost, commentOnPost, deleteComment } = require("../controllers/postController");

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.get("/", getPosts);
router.put("/:postId/like", authMiddleware, likePost);
router.post("/:postId/comment", authMiddleware, commentOnPost);
router.delete("/:postId/comment/:commentId", authMiddleware, deleteComment);

module.exports = router;
