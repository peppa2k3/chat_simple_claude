const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const messageRoutes = require("./routes/messages");

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};
// const corsOptions = {
//   origin:
//     process.env.CORS_ORIGIN
//     ||
//     "http://localhost:8080" ||
//     "http://192.168.28.15:8080",
//   credentials: true,
// };

app.use(cors(corsOptions));
app.use(express.json());
console.log(process.env);
// Socket.IO setup
const io = socketIo(server, {
  cors: corsOptions,
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
// const MONGODB_URI =
//   process.env.MONGODB_URI ||
//   "mongodb://admin:password123@mongodb:27017/chatapp?authSource=admin"
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/messages", messageRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("👤 New user connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    try {
      const Message = require("./models/Message");
      const message = new Message({
        username: data.username,
        text: data.text,
        timestamp: new Date(),
      });
      await message.save();

      // Broadcast to all clients
      io.emit("receiveMessage", {
        _id: message._id,
        username: message.username,
        text: message.text,
        timestamp: message.timestamp,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("👋 User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
