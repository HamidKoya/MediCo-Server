const mongoose = require("mongoose")

const doctorOtpSchema = new mongoose.Schema({
    doctorId: mongoose.Types.ObjectId,
    otp: String,
    createdAt: Date,
    expiresAt: Date
})

module.exports = mongoose.model("doctorOtp",doctorOtpSchema)