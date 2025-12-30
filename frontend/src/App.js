import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./App.css";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "https://dangngochai.io.vn/api";
const BACKEND_SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isNewmess, setIsNewmess] = useState(null);
  function handleHaveNewmess() {
    try {
      if (isNewmess == true) {
        alert("have new mess!");
      }
      alert("have new mess!");
    } catch (error) {}
  }
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch previous messages
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Setup socket connection
    socketRef.current = io(BACKEND_SOCKET_URL);

    socketRef.current.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    socketRef.current.on("receiveMessage", (message) => {
      handleHaveNewmess();
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && socketRef.current) {
      socketRef.current.emit("sendMessage", {
        username: username,
        text: inputMessage,
      });
      setInputMessage("");
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isUsernameSet) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>🎉 MERN Chat App</h1>
          <p>Nhập tên của bạn để bắt đầu</p>
          <form onSubmit={handleSetUsername}>
            <input
              type="text"
              placeholder="Tên của bạn..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <button type="submit">Tham gia Chat</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 MERN Chat</h2>
        <div className="status">
          <span
            className={`status-dot ${
              isConnected ? "connected" : "disconnected"
            }`}
          ></span>
          <span>{isConnected ? "Đã kết nối" : "Mất kết nối"}</span>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            className={`message ${
              msg.username === username ? "own-message" : "other-message"
            }`}
          >
            <div className="message-header">
              <span className="username">{msg.username}</span>
              <span className="timestamp">{formatTime(msg.timestamp)}</span>
            </div>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={!isConnected}
        />
        <button type="submit" disabled={!isConnected || !inputMessage.trim()}>
          Gửi
        </button>
      </form>
    </div>
  );
}

export default App;
