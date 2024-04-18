const mongoose = require('mongoose')

const specialitySchema = mongoose.Schema({

    speciality: {
        type: String,
        require: true
    },
    photo: {
        type: String,
        require: true
    },
    list: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

const speciality = mongoose.model("Speciality", specialitySchema)
module.exports = speciality
