const dotenv = require('dotenv')
dotenv.config()
const { Server } = require("socket.io");

function socketConnection(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_URI,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("connection", socket.id);
    let activeUsers = [];

    socket.on("disconnect", () => {
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
      io.emit("get-users", activeUsers);
    });

    socket.on("setup", (userId) => {
      const existingUser = activeUsers.find((user) => user.userId === userId);
      if (!existingUser) {
        activeUsers.push({
          userId: userId,
          socketId: socket.id,
        });
      }
      io.emit("get-users", activeUsers);
      socket.join(123);
      socket.emit("connected");
    });

    socket.on("send_message", (data) => {
      console.log(data);
      socket.to(123).emit("recieve_message", data);
    });
  });
}
module.exports = socketConnection;
