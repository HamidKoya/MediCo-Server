const mongoose = require("mongoose");
const User = require("./userModel");

const notificationModel = new mongoose.Schema(
  {
    // from: {
    //     type: String,
    //     required: true
    // },
    text: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationModel);
module.exports = Notification;
