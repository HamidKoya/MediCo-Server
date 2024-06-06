const express = require('express')
const router = express.Router()
const adminController = require("../controllers/adminController.js")
const verifyToken = require("../middlewares/adminAuth.js")

router.post('/login',adminController.login)
router.get('/usersList',verifyToken,adminController.usersList)
router.post('/userDetails',adminController.userDetails)
router.post('/blockUnblock',adminController.blockUnblock)

router.post('/addSpeciality',adminController.addSpeciality)
router.get('/specialityList',adminController.specialityList)
router.patch('/listUnlist',adminController.listUnlist)
router.patch('/editSpeciality',adminController.editSpeciality)


router.get('/unVerifiedList',verifyToken,adminController.unVerifiedList)
router.get('/unVerifiedDetails',adminController.unVerifiedDetails)
router.patch('/adminVerify',adminController.adminVerify)
router.get('/doctorList',verifyToken,adminController.doctorList)
router.post('/doctorDetails',adminController.doctorDetails)
router.patch('/doctorblockUnblock',adminController.blockApprove)

router.get('/appointmentList',verifyToken,adminController.appointmentList)
router.post('/appData',adminController.appointmentData)


router.get('/counts',adminController.counts)
router.get('/adminReport',adminController.adminReport)

router.get('/logout',adminController.logout)

router.get('/tokenChecker',verifyToken,adminController.tokenChecker)


module.exports = router