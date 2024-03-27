const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController.js")


router.post("/userSignup", userController.userRegistration);
router.post("/otpVerify",userController.otpVerify)

module.exports = router