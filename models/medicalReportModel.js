const mongoose = require("mongoose");

const medicalReportSchema = mongoose.Schema(
  {
    patientName: {
      type: String,
    },
    doctorName: {
      type: String,
    },
    date: {
      type: String,
    },
    age: {
      type: String,
    },
    gender: {
      type: String,
    },
    complaint: {
      type: String,
    },
    weight: {
      type: String,
    },
    medicalHistory: {
      type: String,
    },
    diagnosis: {
      type: String,
    },
    investigation: {
      type: String,
    },
    appointmentId: {
      type: String,
    },
    additionalInfo: {
      type: String,
    },
  },
  { timestamps: true }
);

const medicalReport = mongoose.model("MedicalReport", medicalReportSchema);
module.exports = medicalReport;
