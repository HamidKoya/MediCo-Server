const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const Otp = require("../models/userOtpModel");
const Payment = require("../models/paymentModel");
const AppointmentModel = require("../models/appointmentModel");
const NotificationModel = require("../models/notificationModel");
const ChatModal = require("../models/chatModel.js");
const PrescriptionModel = require("../models/prescriptionModel.js");
const MedicalReport = require("../models/medicalReportModel.js");
const securePassword = require("../utils/securePassword");
const cloudinary = require("../utils/cloudinary");
const sendEmail = require("../utils/nodeMailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Speciality = require("../models/specialityModel");
const moment = require("moment");
require("dotenv").config();
const mongoose = require("mongoose");

const userRegistration = async (req, res) => {
  try {
    console.log(req.body);
    const { name, mobile, email, password, photo } = req.body;
    const hashedPassword = await securePassword(password);
    const emailExist = await User.findOne({ email: email });
    if (emailExist) {
      res.json({ alert: "This email already exists", status: false });
    } else {
      const photoResult = await cloudinary.uploader.upload(photo, {
        folder: "doctorPhotos",
      });
      const user = new User({
        name: name,
        email: email,
        mobile: mobile,
        password: hashedPassword,
        photo: photoResult.secure_url,
      });
      const userData = await user.save();
      otpId = await sendEmail(userData.name, userData.email, userData._id);
      res.status(201).json({
        status: true,
        userData,
        otpId: otpId,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const otpVerify = async (req, res) => {
  try {
    const { enteredValues, userId } = req.body;
    const otpData = await Otp.find({ userId: userId });
    const { expiresAt } = otpData[otpData.length - 1];
    const correctOtp = otpData[otpData.length - 1].otp;
    if (otpData && expiresAt < Date.now()) {
      res.status(401).json({ message: "Email otp has expired" });
    }
    if (correctOtp == enteredValues) {
      await Otp.deleteMany({ userId: userId });
      await User.updateOne({ _id: userId }, { $set: { otp_verified: true } });
      res.status(200).json({
        status: true,
        message: "User registered successfully , you can login now",
      });
    } else {
      res.status(400).json({ status: false, message: "Incorrect OTP" });
    }
  } catch (error) {
    res.status(400).json({ status: false, message: "incorrect otp" });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const { name, id, email } = await User.findById({ _id: userId });
    const otpId = sendEmail(name, email, id);
    if (otpId) {
      res.status(200).json({ message: `An otp sent to ${email}` });
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "failed to send otp please try again later" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailExist = await User.findOne({ email: email });
    if (emailExist) {
      if (emailExist.otp_verified) {
        if (emailExist.is_blocked === false) {
          const passCheck = await bcrypt.compare(password, emailExist.password);
          if (passCheck) {
            const usertoken = jwt.sign(
              { userId: emailExist._id },
              process.env.JWT_USER_SECRET_KEY,
              { expiresIn: "1h" }
            );
            const expireDate = new Date(Date.now() + 3600000);
            // res.json({ userData: emailExist, token, status: true })

            // const refreshToken = jwt.sign(
            //   { userId: emailExist._id },
            //   process.env.JWT_USER_REFRESH_SECRET_KEY,{expiresIn:"30d"}
            // );

            const userDataToSend = {
              _id: emailExist._id,
              name: emailExist.name,
              email: emailExist.email,
              mobile: emailExist.mobile,
              age: emailExist.age,
              photo: emailExist.photo,
              gender: emailExist.gender,
              wallet: emailExist.wallet,
            };
            res
              .cookie("user_token", usertoken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Only set secure cookies in production
                expires: expireDate,
                sameSite: "strict", // Adjust according to your needs
              })
              .status(200)
              .json({
                userData: userDataToSend,
                message: `Welome ${emailExist.name}`,
              });
          } else {
            // res.json({ alert: "password is incorrect" })
            res.status(401).json({
              message: "password is incorrect",
            });
          }
        } else {
          res.status(401).json({
            message: "User is blocked by admin",
          });
        }
      } else {
        res.status(401).json({
          message: "Email is not verified",
          status: false,
        });
      }
    } else {
      res.status(401).json({ message: "User not registered" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.query;
    const secret = process.env.JWT_USER_SECRET_KEY;
    const isUser = await User.findOne({ email: email });
    if (!isUser) {
      return res.status(200).json({ message: "User is not registered" });
    }
    const token = jwt.sign({ id: isUser._id }, secret, { expiresIn: "5m" });
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.email,
      to: email,
      subject: "Forgot password",
      text: `http://localhost:5173/resetpassword/${isUser._id}/${token}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ message: "Failed to send email for password reset." });
      } else {
        console.log("Email sent:", info.response);
        return res
          .status(200)
          .json({ message: "Email sent successfully for password reset" });
      }
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id, token, password } = req.query;
    const isUser = await User.findById(id);
    if (!isUser) {
      return res.status(401).json({ message: "User is not found" });
    }
    try {
      const verify = jwt.verify(token, process.env.JWT_USER_SECRET_KEY);
      if (verify) {
        console.log("test 1");
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(
          { _id: id },
          { $set: { password: hashedPassword } }
        );
        return res
          .status(200)
          .json({ message: "Successfully changed password" });
      } else {
        return res
          .status(401)
          .json({ message: "Unauthorized token due to the expired token" });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Something wrong with token" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("user_token");
    return res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const editProfile = async (req, res) => {
  try {
    const { name, _id, mobile, gender, age } = req.body;
    const user = await User.findById({ _id });
    if (user) {
      let userData = await User.findByIdAndUpdate(
        { _id: _id },
        { $set: { name: name, mobile: mobile, gender: gender, age: age } },
        { new: true, select: "-password" } // This option returns the modified document
      );

      return res
        .status(200)
        .json({ message: "Successfully profile edited", userData });
    } else {
      return res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const changePhoto = async (req, res) => {
  try {
    const { imageData, userId } = req.body;
    const user = await User.findOne({ _id: userId });
    if (user) {
      const photoResult = await cloudinary.uploader.upload(imageData, {
        folder: "doctorPhotos",
      });
      const userData = await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { photo: photoResult.secure_url } },
        { new: true, select: "-password" }
      );
      return res
        .status(200)
        .json({ message: "Successfully profile photo changed ", userData });
    } else {
      return res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const specialities = async (req, res) => {
  try {
    const data = await Speciality.find();
    const filteredData = data.filter((item) => item.list === true);
    return res.status(200).json(filteredData);
  } catch (error) {
    console.log(error.message);
  }
};

const doctorList = async (req, res) => {
  try {
    const { search, select, page, count, sort } = req.query;
    const query = { is_blocked: false, admin_verify: true }; // Added admin_verify condition

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { speciality: { $regex: new RegExp(search, "i") } },
      ];
    }

    if (select) {
      query.speciality = select;
    }

    // Find total count of doctors without pagination
    const totalDoctorsCount = await Doctor.countDocuments(query);

    let doctors;

    if (sort === "experience") {
      // If sorting by experience
      doctors = await Doctor.find(query)
        .sort({ experience: -1 })
        .skip((page - 1) * count)
        .limit(parseInt(count));
    } else {
      // Default sorting or other sorting options
      doctors = await Doctor.find(query)
        .skip((page - 1) * count)
        .limit(parseInt(count));
    }

    // Send response with doctors and total count
    res.status(200).json({ doctors, totalCount: totalDoctorsCount });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const slotList = async (req, res) => {
  try {
    const { id, date } = req.query;
    const selectedDate = moment.utc(date); // Set timezone to UTC
    const doctor = await Doctor.findById(id);

    // Filter slots based on the selected date
    const availableSlots = doctor.slots.filter((slot) => {
      const slotDate = moment.utc(slot.date); // Set timezone to UTC
      return slotDate.isSame(selectedDate, "day");
    });
    res.status(200).json({ availableSlots });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "internal server error" });
  }
};

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const makePayment = async (req, res) => {
  try {
    const { price, date, userId, id, select } = req.body;
    const selectedDate = moment(date);

    const customer = await stripe.customers.create({
      metadata: {
        userId: "hyev3788fsjhfg9fhjf",
        courseId: "course678dfg65678dfgid",
        price: 299,
      },
      name: "Jhon",
      address: {
        city: "New York",
        country: "US",
        line1: "123 Main Street",
        line2: "Apt 4b",
        postal_code: "10001",
        state: "NY",
      },
    });

    const line_items = [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "Appointment",
            description: "it's for a appointment",
          },
          unit_amount: 299 * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      customer: customer.id,
      mode: "payment",
      success_url: `http://localhost:5173/success?status=true&success&_id=${userId}&drId=${id}&select=${select}&date=${selectedDate}`,
      cancel_url: `http://localhost:5173/`,
    });
    res.status(200).json({ session });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ error: "An error occurred while processing the payment." });
  }
};

const makeAppointment = async (req, res) => {
  try {
    const { userId, doctorId, select, date } = req.body;
    const price = "299";
    const payment = new Payment({
      doctor: doctorId,
      user: userId,
      price: price,
    });
    const paymentData = await payment.save();

    const updatedDoctor = await Doctor.findOneAndUpdate(
      { _id: doctorId, "slots.timeSlots.objectId": select },
      { $set: { "slots.$[outer].timeSlots.$[inner].booked": true } },
      {
        arrayFilters: [
          { "outer._id": { $exists: true } },
          { "inner.objectId": select },
        ],
        new: true, // Return the modified document
      }
    );

    // Finding Selected Slot
    const selectedSlot = updatedDoctor.slots.reduce((found, ts) => {
      const slot = ts.timeSlots.find((item) => item.objectId === select);
      if (slot) {
        found = slot;
      }
      return found;
    }, null);

    //creating an appointment
    const appointment = new AppointmentModel({
      doctor: doctorId,
      user: userId,
      paymentId: paymentData._id,
      slotId: select,
      consultationDate: date,
      start: selectedSlot.start,
      end: selectedSlot.end,
    });

    const appointmentData = await appointment.save();

    const notification = new NotificationModel({
      text: "Your appointment successfully done",
      userId: userId,
    });

    await notification.save();

    // Sending Response
    res
      .status(200)
      .json({ paymentData, appointmentData, message: "Payment is success" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const appointmentList = async (req, res) => {
  try {
    const id = req.query.id;
    const page = parseInt(req.query.currentPage) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;
    const data = await AppointmentModel.aggregate([
      {
        $match: {
          // Match appointments for a specific user id
          user: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctorDetails",
        },
      },
      {
        $unwind: "$doctorDetails",
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: startIndex,
      },
      {
        $limit: limit,
      },
    ]);
    // Format dates using moment
    const formattedData = data.map((appointment) => ({
      ...appointment,
      createdAt: moment(new Date(appointment.createdAt)).format("YYYY-MM-DD "),
      consultationDate: moment(new Date(appointment.consultationDate)).format(
        "YYYY-MM-DD "
      ),
    }));

    const date = new Date();
    const currentDate = moment(date).format("YYYY MM DD");
    const currentTime = moment(date).format("HH:mm");

    const totalItems = await AppointmentModel.countDocuments({ user: id });

    const results = {
      data: formattedData,
      currentDate: currentDate,
      currentTime: currentTime,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems: totalItems,
      },
    };

    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const wallet = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    const amount = user.wallet;
    res.status(200).json(amount);
  } catch (error) {
    console.log(error.message);
  }
};

const walletPayment = async (req, res) => {
  try {
    const price = 299;
    const { userId, id, select, date } = req.body;
    const userData = await User.findById(userId);
    if (!userData) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (userData.wallet < price) {
      res.status(200).json({ message: "Insufficient Balance" });
    } else {
      let newWalletAmount = userData.wallet - price;
      await User.findByIdAndUpdate(userId, { wallet: newWalletAmount });

      const selectDate = moment(date);

      const payment = new Payment({
        doctor: id,
        user: userId,
        price: price,
      });

      const paymentData = await payment.save();

      const updatedDoctor = await Doctor.findOneAndUpdate(
        { _id: id, "slots.timeSlots.objectId": select },
        { $set: { "slots.$[outer].timeSlots.$[inner].booked": true } },
        {
          arrayFilters: [
            { "outer._id": { $exists: true } },
            { "inner.objectId": select },
          ],
          new: true, // Return the modified document
        }
      );

      const selectedSlot = updatedDoctor.slots.reduce((found, ts) => {
        const slot = ts.timeSlots.find((item) => item.objectId === select);
        if (slot) {
          found = slot;
        }
        return found;
      }, null);

      const appointment = new AppointmentModel({
        doctor: id,
        user: userId,
        paymentId: paymentData._id,
        slotId: select,
        consultationDate: selectDate,
        start: selectedSlot.start,
        end: selectedSlot.end,
      });

      const appointmentData = await appointment.save();

      const notification = new NotificationModel({
        text: "Your appointment successfully done",
        userId: userId,
      });

      await notification.save();

      res
        .status(201)
        .json({ paymentData, appointmentData, message: "Payment is success" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const createChat = async (req, res) => {
  try {
    const { userid, doctorid } = req.body;

    const chatExist = await ChatModal.findOne({
      members: { $all: [userid, doctorid] },
    });
    if (!chatExist) {
      const newChat = new ChatModal({
        members: [userid.toString(), doctorid.toString()],
      });
      await newChat.save();
      res.status(200).json({ message: "Your are connected" });
    }

    const notification = new NotificationModel({
      text: "Your chat created successfully",
      userId: userid,
    });

    await notification.save();

    res.status(200).json({ message: "You are connected" });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { id, userId, paymentId } = req.body;
    // Delete the payment
    await Payment.findByIdAndDelete(paymentId);

    // Update the appointment status to Cancelled
    await AppointmentModel.findByIdAndUpdate(
      id,
      { $set: { status: "Cancelled" } },
      { new: true }
    );

    const data = await AppointmentModel.aggregate([
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctorDetails",
        },
      },
      {
        $unwind: "$doctorDetails",
      },
    ]);

    // Find the appointment in the data
    const appointment = data.find(
      (appointment) => appointment._id.toString() === id
    );

    // Update the booked field to false in the timeSlots array
    appointment.doctorDetails.slots[0].timeSlots.forEach((timeSlot) => {
      timeSlot.booked = false;
    });

    // Save the updated doctorDetails back to the database
    await Doctor.findByIdAndUpdate(
      appointment.doctorDetails._id,
      { $set: { slots: appointment.doctorDetails.slots } },
      { new: true }
    );

    // Refund the user's wallet
    await User.findByIdAndUpdate(
      userId,
      { $inc: { wallet: 299 } },
      { new: true }
    );

    const cancellationNotification = new NotificationModel({
      text: "Your appointment has been cancelled successfully.",
      userId: userId,
    });

    // Save the appointment cancellation notification
    await cancellationNotification.save();

    const creditNotification = new NotificationModel({
      text: "Amount credited to your wallet.",
      userId: userId,
    });

    // Save the amount credited notification
    await creditNotification.save();

    res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addReview = async (req, res) => {
  try {
    const { userId, drId, review, rating } = req.body;
    const doctor = await Doctor.findById(drId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if the user has already posted a review for this doctor
    const existingReview = doctor.review.find(
      (r) => r.postedBy.toString() === userId.toString()
    );

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "Review already submitted by this user" });
    }

    const newReview = {
      text: review,
      star: rating,
      postedBy: userId,
      postedDate: new Date(),
    };

    doctor.review.push(newReview);
    await doctor.save(); // Save the updated doctor object

    const notification = new NotificationModel({
      text: "Your review successfuly added",
      userId: userId,
    });

    await notification.save();

    res
      .status(200)
      .json({ message: "Review added successfully", review: newReview });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const medicineDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await PrescriptionModel.find({ appointmentId: id });
    res.status(200).json({ result });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const medicalReport = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await MedicalReport.findOne({ appointmentId: id });

    res.status(200).json({ result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getReview = async (req, res) => {
  try {
    const { id } = req.query;
    const doctor = await Doctor.findById(id).populate({
      path: "review.postedBy",
      model: "User",
      select: "name email photo", // You can choose which user details to select
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Sort reviews by the 'postedDate' property in descending order
    doctor.review.sort((a, b) => b.postedDate - a.postedDate);

    const reviewDetails = doctor.review.map((review) => ({
      text: review.text,
      star: review.star,
      postedBy: {
        name: review.postedBy.name,
        email: review.postedBy.email,
        photo: review.postedBy.photo,
      },
      postedDate: review.postedDate,
    }));

    res.status(200).json({ reviews: reviewDetails });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { id } = req.query;
    const page = req.query.page || 1;
    const perPage = 10;

    const data = await NotificationModel.find({ userId: id })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    const totalNotifications = await NotificationModel.countDocuments({
      userId: id,
    });
    const totalPages = Math.ceil(totalNotifications / perPage);

    if (!data) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ notifications: data, totalPages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const profileTest = async (req, res) => {
  try {
    res.status(200).json("test competed");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  userRegistration,
  otpVerify,
  resendOtp,
  userLogin,
  forgotPassword,
  resetPassword,
  logout,
  editProfile,
  changePhoto,
  specialities,
  doctorList,
  slotList,
  makePayment,
  makeAppointment,
  appointmentList,
  wallet,
  walletPayment,
  createChat,
  cancelAppointment,
  addReview,
  medicineDetails,
  medicalReport,
  getReview,
  getNotifications,
  profileTest,
};
