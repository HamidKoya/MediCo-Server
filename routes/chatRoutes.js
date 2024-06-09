const express = require("express");
const chatRoute = express();
const chatController = require("../controllers/chatController.js");

const userVerifyToken = require("../middlewares/userAuth.js")
const doctorVerifyToken = require("../middlewares/doctorAuth.js")

chatRoute.get("/chatuser/:userId",userVerifyToken, chatController.userChats);
chatRoute.get("/chatdoctor/:userId",doctorVerifyToken, chatController.userChats);
chatRoute.get('/doctorData/:doctorId',chatController.doctorData)
chatRoute.get('/userData/:userId',chatController.userData)

module.exports = chatRoute;
