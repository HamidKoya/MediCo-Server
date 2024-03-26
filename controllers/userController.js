const User = require('../models/userModel')
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

module.exports = {userRegistration}