const mongoose = require("mongoose")
const User = require("./userModel")


const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,
    },

    speciality: {
        type: String,
        require: true
    },
    password: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        required: true
    },
    certificates: [
        {
            type: String,
            required: true
        }
    ],
    otp_verified: {
        type: Boolean,
        default: false
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    admin_verify: {
        type: Boolean,
        default: false
    },
    // languages: [
    //     {
    //         type: String
    //     }
    // ],
    experience: {
        type: String,
        default: 0
    },
    bio: {
        type: String,
    },
    slots: [
        {
            date: {
                type: String,
            },
            startTime: {
                type: String,
            },
            endTime: {
                type: String,
            },
            status: {
                type: String,
                default: "active",
            },
            slotDuration: {
                type: String,
            },
            timeSlots: {
                type: Array
            },
            is_blocked: {
                type: Boolean,
                default: false
            },
        },
    ],
    review: [
        {
            text: String,
            star: Number,
            postedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: User,
            },
            postedDate: { type: Date }
        }
    ]


}, { timestamps: true })

const Doctor = mongoose.model("Doctor", doctorSchema)
module.exports = Doctor
