const express = require('express')
const router = express.Router()
const doctorController = require("../controllers/doctorController.js")

router.post('/signup',doctorController.signup)
router.post('/otpVerify',doctorController.otpVerify)
router.post('/resendOtp',doctorController.resendOtp)
router.post('/login',doctorController.login)
router.get('/forgotPassword',doctorController.forgotPassword)


module.exports = router