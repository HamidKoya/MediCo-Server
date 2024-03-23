const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    otp_verified: {
        type: Boolean,
        default: false
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    age: {
        type: Number
    },
    photo: {
        type: String
    },
    gender: {
        type: String

    },
    wallet: {
        type: Number,
        default: 0
    },


}, { timestamps: true })

const User = mongoose.model("User", userSchema)
module.exports = User