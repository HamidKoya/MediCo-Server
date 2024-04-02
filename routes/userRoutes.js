const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController.js")

router.post("/userSignup", userController.userRegistration);
router.post("/otpVerify",userController.otpVerify)
router.post("/resendOtp",userController.resendOtp)
router.post("/userLogin",userController.userLogin)
router.get("/forgotPassword",userController.forgotPassword)

module.exports = router