const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController.js")

router.post("/userSignup", userController.userRegistration);
router.post("/otpVerify",userController.otpVerify)
router.post("/resendOtp",userController.resendOtp)
router.post("/userLogin",userController.userLogin)
router.get("/forgotPassword",userController.forgotPassword)
router.patch("/resetPassword",userController.resetPassword)
router.get('/logout',userController.logout)
router.post('/editProfile',userController.editProfile)
router.post('/changePhoto',userController.changePhoto)
router.get('/specialities',userController.specialities)
router.get('/doctorList',userController.doctorList)
router.get('/slotList',userController.slotList)
router.post('/makePayment',userController.makePayment)

module.exports = router