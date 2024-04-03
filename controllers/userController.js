const User = require("../models/userModel");
const Otp = require("../models/userOtpModel");
const securePassword = require("../utils/securePassword");
const cloudinary = require("../utils/cloudinary");
const sendEmail = require("../utils/nodeMailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const userRegistration = async (req, res) => {
  try {
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
      return res.status(401).json({ message: "Email otp has expired" });
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
              process.env.JWT_USER_SECRET_KEY
            );
            const expireDate = new Date(Date.now() + 3600000);
            // res.json({ userData: emailExist, token, status: true })
            res
              .cookie("user_token", usertoken, {
                httpOnly: true,
                expires: expireDate,
              })
              .status(200)
              .json({
                userData: emailExist,
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
    const {email} = req.query
    const secret = process.env.JWT_USER_SECRET_KEY
    const isUser = await User.findOne({email:email})
    if(!isUser){
      return res.status(200).json({message:'User is not registered'})
    }
    const token = jwt.sign({id:isUser._id},secret,{expiresIn:"5m"})
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth : {
        user:process.env.email,
        pass:process.env.PASSWORD
      }
    })
    const mailOptions = {
      from: process.env.email,
      to:email,
      subject: "Forgot password",
      text:`http://localhost:5173/resetpassword/${isUser._id}/${token}`
    }
    transporter.sendMail(mailOptions,function (error,info){
      if(error){
        console.error("Error sending email:",error)
        return res.status(500).json({message:"Failed to send email for password reset."})
      }else{
        console.log('Email sent:',info.response);
        return res.status(200).json({message:"Email sent successfully for password reset"})
      } 
    })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({message:"Internal Server Error"})
  }
};

const resetPassword = async (req,res) => {
  try {
    const {id,token,password} = req.query
    const isUser = await User.findById(id)
    if(!isUser){
      return res.status(401).json({message: 'User is not found'})
    }
    try {
      const verify = jwt.verify(token,process.env.JWT_USER_SECRET_KEY)
      if(verify){
        console.log('test 1');
        const hashedPassword = await bcrypt.hash(password,10)
        await User.findByIdAndUpdate(
          {_id:id},{$set:{password:hashedPassword}}
        )
        return res.status(200).json({message:"Successfully changed password"})
      }else{
        return res.status(401).json({message:"Unauthorized token due to the expired token"})
      }
    } catch (error) {
      console.log(error.message);
            return res.status(400).json({ message: "Something wrong with token" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const logout = async (req,res) => {
  try {
     res.clearCookie("user_token");
     return res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  userRegistration,
  otpVerify,
  resendOtp,
  userLogin,
  forgotPassword,
  resetPassword,
  logout
};
