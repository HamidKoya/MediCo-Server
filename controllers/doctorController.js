const securePassword = require("../utils/nodeMailer.js");
const Doctor = require("../models/doctorModel.js");
const cloudinary = require("../utils/cloudinary.js");
const sendEmail = require("../utils/doctorMailer.js");
const Otp = require("../models/doctorOtpModel.js");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')

const signup = async (req, res) => {
  try {
    const { name, mobile, email, speciality, password, photo, certificates } =
      req.body;
    const spassword = await securePassword(password);
    const emailExist = await Doctor.findOne({ email: email });
    if (emailExist) {
      res
        .status(409)
        .json({ status: "Partner already registered with this email" });
    } else {
      const photoResult = await cloudinary.uploader.upload(photo, {
        folder: "doctorPhotos",
      });

      // Upload multiple certificates to Cloudinary
      const certificateResults = await Promise.all(
        certificates.map(async (certificate) => {
          return await cloudinary.uploader.upload(certificate, {
            folder: "doctorsCertificates",
          });
        })
      );
      const doctor = new Doctor({
        name: name,
        mobile: mobile,
        email: email,
        speciality: speciality,
        password: spassword,
        photo: photoResult.secure_url,
        certificates: certificateResults.map((result) => result.secure_url),
      });
      const doctorData = await doctor.save();
      otpId = await sendEmail(
        doctorData.name,
        doctorData.email,
        doctorData._id
      );

      res.status(201).json({
        status: `Otp has sent to ${email}`,
        doctorData: doctorData,
        otpId: otpId,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "Internal Server Error" });
  }
};

const otpVerify = async (req, res) => {
  try {
    const { otp, doctorId } = req.body;
    const otpData = await Otp.find({ doctorId: doctorId });

    const { expiresAt } = otpData[otpData.length - 1];
    const correctOtp = otpData[otpData.length - 1].otp;

    if (otpData && expiresAt < Date.now()) {
      res.status(401).json({ message: "Email OTP has expired" });
    }
    if (correctOtp === otp) {
      await Otp.deleteMany({ doctorId: doctorId });
      await Doctor.updateOne(
        { _id: doctorId },
        { $set: { otp_verified: true } }
      );
      res.status(200).json({
        status: true,
        message: "Doctor registered successfully,You can login now",
      });
    } else {
      res.status(400).json({ status: false, message: "Incorrect OTP" });
    }
  } catch (error) {
    res.status(400).json({ status: false, message: "Incorrect OTP" });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const { id, name, email } = await Doctor.findById({ _id: doctorId });
    const otpId = sendEmail(name, email, id);
    if (otpId) {
      res.status(200).json({
        message: `An OTP has been resent to ${email}.`,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again later." });
  }
};

const login = async (req, res) => {
  console.log('test 1');
  try {
    const { email, password } = req.body;
    const emailExist = await Doctor.findOne({ email: email });
    if (emailExist) {
  console.log('test 2');

      if (emailExist.otp_verified) {
  console.log('test 3');

        if (emailExist.admin_verify) {
  console.log('test 4');

          if (emailExist.is_blocked === false) {
  console.log('test 5');

            const passCheck = await bcrypt.compare(
              password,
              emailExist.password
            );
            if (passCheck) {
  console.log('test 6');

              const doctortoken = jwt.sign(
                { doctorId: emailExist._id},
                process.env.JWT_DOCTOR_SECRET_KEY
              );
              const expireDate = new Date(Date.now() + 3600000);
              res.cookie("doctor_token",doctortoken, {
                httpOnly: true,
                expires: expireDate,
              })
              res
                .status(200)
                .json({
                  doctorData: emailExist,
                  message: `Welome ${emailExist.name}`,
                });
            } else {
  console.log('test 7');

              res.status(401).json({
                message: "password is incorrect",
              });
            }
          } else {
  console.log('test 8');

            res.status(401).json({
              message: "You are blocked by admin",
            });
          }
        } else {
  console.log('test 9');

          res.status(401).json({
            message: "Admin needs to verify you",
          });
        }
      } else {
  console.log('test 10');

        otpId = await sendEmail(
          emailExist.name,
          emailExist.email,
          emailExist._id
        );

        res.status(403).json({
          message: "Email is not verified",
          status: false,
          otpId: otpId,
        });
      }
    } else {
  console.log('test 11');

      return res.status(404).json({ message: "Doctor not registered" });
    }
  } catch (error) {
  console.log('test 12');

    console.log(error.message);
    return res.status(500).json({ status: "Internal Server Error" });
  }
};

module.exports = {
  signup,
  otpVerify,
  resendOtp,
  login,
};
