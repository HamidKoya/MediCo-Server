const mongoose = require('mongoose')
const Doctor = require('./doctorModel')
const User = require('./userModel')

const paymentModel = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Doctor,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        require: true
    },
    price:{
        type:String,
        required:true
    },
    status: {
        type: Boolean,
        default: true,
    },
},{ timestamps: true })

const Payment = mongoose.model("Payment",paymentModel)
module.exports = Payment