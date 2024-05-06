const mongoose = require("mongoose");
const Doctor = require("./doctorModel");
const User = require("./userModel");
const Payment = require("./paymentModel");

const appointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Doctor,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      require: true,
    },
    status: {
      type: String,
      trim: true,
      default: "Pending",
    },
    consultationDate: {
      type: String,
    },
    start: {
      type: String,
    },
    end: {
      type: String,
    },
    rescheduled: {
      type: Boolean,
      default: false,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Payment,
      required: true,
    },
    slotId: {
      type: String,
    },
  },
  { timestamps: true }
);

const appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = appointment;
