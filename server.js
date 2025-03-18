const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cassandraClient = require("./config/cassandra");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cookieParser());

// Cache to store user details temporarily
const userCache = new Map();

/**
 * 🔹 Validate and extract user data from token
 */
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    console.log(token);
    exit();
    if (!token) return next(new Error("❌ No token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    console.log(decoded.id);
    exit();

    // Check cache first
    if (userCache.has(userId)) {
      socket.user = userCache.get(userId);
      return next();
    }

    // Fetch user details from API
    const response = await axios.get(`http://localhost:8000/api/user/${userId}`);
    const user = response.data;

    // Store in cache
    userCache.set(userId, user);
    socket.user = user;

    next();
  } catch (error) {
    next(new Error("❌ Authentication failed"));
  }
};

io.use(authenticateSocket);

io.on("connection", (socket) => {
  // console.log(`✅ User Connected: ${socket.user.name} (${socket.user.email})`);
  console.log('web socket connected');

  socket.on("message", async (data) => {
    const { receiver, message } = data;
    console.log(message);
    // console.log(`📩 ${socket.user.name} sent a message: ${message}`);

    try {
      // Store latest message in Cassandra
      const query = `
        INSERT INTO recent_chats (user_id, contact_id, last_message, timestamp, unread_count)
        VALUES (?, ?, ?, toTimestamp(now()), 0)
      `;
      await cassandraClient.execute(query, [socket.user.id, receiver, message]);
      console.log("✅ Message stored in Cassandra");

      // Emit message to receiver
      io.emit("newMessage", {
        sender: { id: socket.user.id, name: socket.user.name, email: socket.user.email },
        receiver,
        message,
      });
    } catch (error) {
      console.error("❌ Failed to store message in Cassandra:", error);
    }
  });

  socket.on("disconnect", () => {
   console.log('socket disconnected');
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`🚀 Chat server running on port ${process.env.PORT || 3000}`);
});
