const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "https://arcade.pivotpt.in",
  },
});

app.use(express.static(path.resolve(__dirname + "/../html")));

// Middleware 2: Parses JSON request bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/pushMessageToId", (req, res) => {
  const { id, event, message } = req.body;
  io.to(id).emit(event, message);
  res.json({
    status: "0",
    message: `ok`,
  });
});

app.post("/pushMessageToRoom", (req, res) => {
  const { room, event, message } = req.body;
  io.to(room).emit(event, message);
  res.json({
    status: "0",
    message: `ok`,
  });
});

const users = new Map();

io.on("connection", (socket) => {
  //console.log(socket);
  console.log(socket.handshake.query.name + " connected!");
  addUser(socket.id, socket.handshake.query.name, socket.handshake.query.email);
  io.emit("connection notification", socket.handshake.query.name);

  socket.on("disconnect", () => {
    socket.broadcast.emit("finish typing", socket.handshake.query.name);
    rmUser(socket.id);
    console.log(socket.handshake.query.name + " disconnected!");
    io.emit("disconnection notification", socket.handshake.query.name);
  });
  socket.on("chat message", (msg) => {
    socket.broadcast.emit("chat message", msg);
  });
  socket.on("typing", () => {
    socket.broadcast.emit("typing", socket.handshake.query.name);
  });
  socket.on("finish typing", () => {
    socket.broadcast.emit("finish typing", socket.handshake.query.name);
  });

  socket.on("join_room", (room) => {
    console.log("in Join_room to join " + room);
    socket.join(room);
    console.log("id : " + JSON.stringify(getUser(socket.id)));
    //socket.to(room).emit("joined_room");
    io.sockets.in(room).emit("joined_room", JSON.stringify(getUser(socket.id)));
  });

  socket.on("get_users_in_room", async (roomName, cb) => {
    const socketsInRoom = await io.in(roomName).allSockets(); // returns Set of socket IDs
    const userList = Array.from(socketsInRoom); // convert Set to Array
    cb(userList);
  });

  socket.on("list_online_users", () => {
    const u = (obj = Object.fromEntries(users));
    console.log("id : ", socket.id);
    console.log(u);
    io.to(socket.id).emit("list_online_users", u);
  });
  socket.on("leave_room", (room) => {
    console.log("leave room " + room);
    socket.leave(room);
    console.log("id : " + JSON.stringify(getUser(socket.id)));
  });
});

server.listen(8000, () => {
  console.log("Listening on *: 8000");
});

function addUser(id, name, email) {
  users.set(id, { id: id, name: name, email: email });
}

function rmUser(id) {
  users.delete(id);
}

function getUser(id) {
  return users.get(id);
}

function cb(ul) {
  console.log(ul);
}
