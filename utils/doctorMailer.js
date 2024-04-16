const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
const Otp = require("../models/doctorOtpModel.js")

dotenv.config();


const sendEmail = async (name, email, doctorId) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    let otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const options = {
      from: process.env.EMAIL,
      to: email,
      subject: "for email verification",
      html: `
      <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <div style="border-bottom: 1px solid #eee">
            <a href="" style="font-size: 1.4em; color: #82AE46; text-decoration: none; font-weight: 600">
              MediCo
            </a>
          </div>
          <p style="font-size: 1.1em">Hi,${name}</p>
          <p>Thank you for choosing MediCo. Use the following OTP to complete your Sign Up procedures. OTP is valid for a few minutes</p>
          <h2 style="background: #82AE46; margin: 0 auto; width: max-content; padding: 0 10px; color: white; border-radius: 4px;">
            ${otp}
          </h2>
          <p style="font-size: 0.9em;">Regards,<br />MediCo</p>
          <hr style="border: none; border-top: 1px solid #eee" />
          <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
            <p>MediCo</p>
            <p>Your Health Partner</p>
          </div>
        </div>
      </div>
    `
    };

    const DoctorVerificationOtp = new Otp({
      doctorId: doctorId,
      otp: otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 300000
    })

    let verified = await DoctorVerificationOtp.save()

    transporter.sendMail(options, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log("otp -> ", otp);
        // console.log("email has been sent to:-", info.response);
        console.log("email has been send ")
      }
    });

    return verified._id

  } catch (error) {
    console.log(error.message);
  }
}

module.exports = sendEmail;

