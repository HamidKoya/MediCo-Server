const express = require("express");
const socketConnection = require('./socketIo')
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require('http')
dotenv.config();
const Connection = require("./config/dbConfig");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());


app.use(
  cors({
  origin: [process.env.CORS_URI],
    methods: ["GET", "POST", "PUT", "PATCH"],
    credentials: true,
  })
);



const userRoute = require("./routes/userRoutes");
app.use("/", userRoute);

const adminRoute = require("./routes/adminRoutes")
app.use("/admin",adminRoute)

const doctorRoute = require("./routes/doctorRoutes")
app.use("/doctor",doctorRoute)

const chatRoute = require("./routes/chatRoutes")
app.use("/chat",chatRoute)

const messageRoute = require("./routes/messageRoutes")
app.use("/message",messageRoute)

Connection();

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "internal server error";
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});

const server = http.createServer(app)
socketConnection(server)

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
