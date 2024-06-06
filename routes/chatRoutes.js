const express = require("express");
const chatRoute = express();
const chatController = require("../controllers/chatController.js");

const verifyToken = require("../middlewares/userAuth.js")

chatRoute.get("/chat/:userId",verifyToken, chatController.userChats);
chatRoute.get('/doctorData/:doctorId',chatController.doctorData)
chatRoute.get('/userData/:userId',chatController.userData)

module.exports = chatRoute;
