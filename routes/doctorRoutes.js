const express = require('express')
const router = express.Router()
const doctorController = require("../controllers/doctorController.js")

router.post('/signup',doctorController.signup)
router.get('/specialtyName',doctorController.specialtyName)
router.post('/otpVerify',doctorController.otpVerify)
router.post('/resendOtp',doctorController.resendOtp)
router.post('/login',doctorController.login)
router.get('/forgotPassword',doctorController.forgotPassword)
router.patch('/resetPassword',doctorController.resetPassword)
router.post('/changePhoto',doctorController.changePhoto)
router.post('/editProfile',doctorController.editProfile)



module.exports = router