const express = require('express')
const router = express.Router()
const adminController = require("../controllers/adminController.js")


router.get('/usersList',adminController.usersList)
router.post('/userDetails',adminController.userDetails)
router.post('/blockUnblock',adminController.blockUnblock)


module.exports = router