// server.js
const { createServer } = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Adjust to match your frontend
    methods: ["GET", "POST"],
  },
});

const activeRooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("host-game", () => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.join(roomId);
    activeRooms.set(roomId, [socket.id]);
    socket.emit("game-hosted", roomId);
    console.log(`Game hosted with ID: ${roomId}`);
  });

  socket.on("join-game", (roomId) => {
    const players = activeRooms.get(roomId);
    console.log("Attempt to join room:", roomId, players);

    if (!players) {
      socket.emit("error-message", "Room does not exist.");
    } else if (players.length >= 2) {
      socket.emit("error-message", "Room is full.");
    } else {
      socket.join(roomId);
      players.push(socket.id);
      activeRooms.set(roomId, players);
      socket.emit("joined-game", roomId);
      socket.to(roomId).emit("player-joined", socket.id);
      console.log(`Player ${socket.id} joined room ${roomId}`);
    }
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (activeRooms.has(roomId)) {
        let players = activeRooms.get(roomId);
        players = players.filter((id) => id !== socket.id);
        if (players.length === 0) {
          activeRooms.delete(roomId);
        } else {
          activeRooms.set(roomId, players);
          socket.to(roomId).emit("player-left", socket.id);
        }
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(3001, () => {
  console.log("Server running on port 3001");
});
