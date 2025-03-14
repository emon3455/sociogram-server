require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

// router imports
const authRoutes = require("./router/authRoutes");
const postRoutes = require("./router/postRoutes");
const userRoutes = require("./router/userRoutes");
const notificationRoutes = require("./router/notificationRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Store io in app for access in controllers
app.set("io", io);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((error) => console.error('MongoDB connection error:', error));

// router
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_notification", ({ userId, message }) => {
    io.emit(`notification_${userId}`, { message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Sociogram server is running...");
});

server.listen(5000, () => console.log("Server running on port 5000"));
