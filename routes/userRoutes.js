const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController.js")


router.post("/userSignup", userController.userRegistration);
router.post("/otpVerify",userController.otpVerify)
router.post("/resendOtp",userController.resendOtp)

module.exports = router