const User = require('../models/userModel')

const userRegistration = async (req,res) =>{
    try {
        const { name, email} = req.body
        const user = new User({
            name: name,
            email: email
        })
        const userData = await user.save()
        res.status(200).json(userData)
    } catch (error) {
        console.log(error);
    }
}

module.exports = {userRegistration}