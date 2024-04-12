const User = require('../models/userModel.js')

const usersList = async (req,res) =>{
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) ||10
        const totalItems = await User.countDocuments()


        const users = await User.find()
        .sort({createdAt: -1})
        .skip((page-1)*limit)
        .limit(limit)

        const results = {
            users:users,
            pagination:{
                currentPage:page,
                totalPages:Math.ceil(totalItems/limit),
                totalItems:totalItems

            }
        }
        res.status(200).json(results)
        
    }catch(error) {
        console.log(error.message);
        res.status(500).json({message:"internal server error"})
    }
}

const userDetails = async (req, res) => {
    try {
        const { id } = req.body
        const details = await User.findOne({ _id: id })
        res.status(200).json({ details }) 
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const blockUnblock = async (req, res) => {
    try {
        const { id } = req.body
        const user = await User.findOne({ _id: id })
        const blocked = user.is_blocked

        if (blocked) {
            user.is_blocked = false;
            await user.save();
        } else {
            user.is_blocked = true;
            await user.save();
        }
        res.status(200).json({ user });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    usersList,
    userDetails,
    blockUnblock
}