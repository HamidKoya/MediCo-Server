const express = require('express')
const router = express.Router()
const doctorController = require("../controllers/doctorController.js")

router.post('/signup',doctorController.signup)


module.exports = router