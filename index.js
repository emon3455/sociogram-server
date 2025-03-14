require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const authRoutes = require("./router/authRoutes");
const postRoutes = require("./router/postRoutes");
const userRoutes = require("./router/userRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("send_notification", (data) => {
    io.emit(`notification_${data.userId}`, data.message);
  });
});

app.get("/", (req, res) => {
  res.send("Sociogram server is running...");
});

server.listen(5000, () => console.log("Server running on port 5000"));
