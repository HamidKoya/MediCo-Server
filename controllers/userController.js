const User = require('../models/userModel')
const Otp = require('../models/userOtpModel')
const securePassword = require('../utils/securePassword')
const cloudinary = require('../utils/cloudinary')
const sendEmail = require('../utils/nodeMailer')

const userRegistration = async (req,res) =>{
    try {
        const {name,mobile,email,password,photo} = req.body
        const hashedPassword = await securePassword(password)
        const emailExist = await User.findOne({email:email})
        if(emailExist){
            res.json({alert:'This email already exists',status:false})
        }else{
            const photoResult = await cloudinary.uploader.upload(photo,{folder:'doctorPhotos'})
            const user = new User({
                name:name,
                email:email,
                mobile:mobile,  
                password:hashedPassword,
                photo:photoResult.secure_url
            })
            const userData = await user.save()
            otpId = await sendEmail(userData.name,userData.email,userData._id)
            res.status(201).json({
                status: true,
                userData,
                otpId:otpId,
            })

        }
    } catch (error) {
        console.log(error);
    }
}

const otpVerify = async (req,res) =>{
    try {
        const {enteredValues,userId} = req.body
        const otpData = await Otp.find({userId:userId})
        const {expiresAt}= otpData[otpData.length-1]
        const correctOtp = otpData[otpData.length-1].otp
        if(otpData&&expiresAt<Date.now()){
            return res.status(401).json({message:'Email otp has expired'})
        }
        if(correctOtp==enteredValues){
            await Otp.deleteMany({userId:userId});
            await User.updateOne(
                {_id:userId},
                {$set:{otp_verified:true}}
            );
            res.status(200).json({
                status:true,
                message: 'User registered successfully , you can login now',
            })
        }else{
            res.status(400).json({ status: false, message: "Incorrect OTP" });
        }

    } catch (error) {
        res.status(400).json({status:false,message:'incorrect otp'})
    }
}

module.exports = {userRegistration,otpVerify}