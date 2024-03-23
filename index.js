const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
dotenv.config();
const Connection = require('./config/dbConfig')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const userRoute = require("./routes/userRoutes");
app.use("/", userRoute);



// Enable CORS for specific origin and methods
app.use(
  cors({
    origin: process.env.CORS_URI, 
    methods: ["GET", "POST", "PUT", "PATCH"],
    credentials: true,
  })
);

Connection();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
