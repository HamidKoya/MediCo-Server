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


module.exports = router