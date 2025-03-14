const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getNotifications, markNotificationAsSeen } = require("../controllers/notificationController");

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.put("/:notificationId", authMiddleware, markNotificationAsSeen);

module.exports = router;
