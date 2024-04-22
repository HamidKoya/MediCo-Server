const express = require('express')
const router = express.Router()
const adminController = require("../controllers/adminController.js")

router.post('/login',adminController.login)
router.get('/usersList',adminController.usersList)
router.post('/userDetails',adminController.userDetails)
router.post('/blockUnblock',adminController.blockUnblock)

router.post('/addSpeciality',adminController.addSpeciality)
router.get('/specialityList',adminController.specialityList)
router.patch('/listUnlist',adminController.listUnlist)
router.patch('/editSpeciality',adminController.editSpeciality)


router.get('/unVerifiedList',adminController.unVerifiedList)
router.get('/unVerifiedDetails',adminController.unVerifiedDetails)
router.patch('/adminVerify',adminController.adminVerify)
router.get('/doctorList',adminController.doctorList)
router.post('/doctorDetails',adminController.doctorDetails)
router.patch('/doctorblockUnblock',adminController.blockApprove)


module.exports = router