const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { sendFriendRequest, acceptFriendRequest, getFriendsList } = require("../controllers/userController");

const router = express.Router();

router.post("/friend-request", authMiddleware, sendFriendRequest);
router.post("/accept-friend", authMiddleware, acceptFriendRequest);
router.get("/friends", authMiddleware, getFriendsList);

module.exports = router;
