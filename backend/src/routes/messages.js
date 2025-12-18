const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Get all messages
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new message
router.post("/", async (req, res) => {
  try {
    const message = new Message({
      username: req.body.username,
      text: req.body.text,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
