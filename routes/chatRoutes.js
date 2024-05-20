const express = require("express");
const chatRoute = express();
const chatController = require("../controllers/chatController.js");

chatRoute.get("/chat/:userId", chatController.userChats);
chatRoute.get('/doctorData/:doctorId',chatController.doctorData)

module.exports = chatRoute;
