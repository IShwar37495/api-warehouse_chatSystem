const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cassandraClient = require("./config/cassandra");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin:"*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cookieParser());


io.on("connection", (socket) => {
  console.log("socket  connected");

  socket.on("sendMessage", async (data) => {
    const { receiver, message } = data;
    console.log(message);

    // const query = "INSERT INTO messages (id, sender_email, receiver_email, message, timestamp) VALUES (uuid(), ?, ?, ?, toTimestamp(now()))";
    
    // await cassandraClient.execute(query, [socket.user.email, receiver, message]);
    // io.emit("newMessage", { sender: socket.user.email, receiver, message });
  });

  socket.on("disconnect", () => {
    console.log(`user diconnected`);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Chat server running on port ${process.env.PORT || 3000}`);
});
