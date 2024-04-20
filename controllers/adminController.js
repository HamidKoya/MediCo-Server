const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/userModel.js");
const cloudinary = require("../utils/cloudinary.js");
const Speciality = require("../models/specialityModel.js");
const Doctor = require("../models/doctorModel.js");

const login = async (req, res) => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const { username, password } = req.body;

    if (username === adminUsername) {
      const passCheck = password == adminPassword;

      if (passCheck) {
        const admintoken = jwt.sign(
          { username },
          process.env.JWT_ADMIN_SECRET_KEY,
          { expiresIn: "1h" }
        );
        const expireDate = new Date(Date.now() + 3600000);
        res
          .cookie("admin_token", admintoken, {
            httpOnly: true,
            expires: expireDate,
          })
          .status(200)
          .json({ admintoken, message: `Welcome ${username}` });
      } else {
        return res.status(400).json({ message: "Password is incorrect" });
      }
    } else {
      return res.status(400).json({ message: "Invalid username" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const usersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const totalItems = await User.countDocuments();

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const results = {
      users: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems: totalItems,
      },
    };
    res.status(200).json(results);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

const userDetails = async (req, res) => {
  try {
    const { id } = req.body;
    const details = await User.findOne({ _id: id });
    res.status(200).json({ details });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const blockUnblock = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findOne({ _id: id });
    const blocked = user.is_blocked;

    if (blocked) {
      user.is_blocked = false;
      await user.save();
    } else {
      user.is_blocked = true;
      await user.save();
    }
    res.status(200).json({ user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addSpeciality = async (req, res) => {
  try {
    const specialityName = req.body.speciality;
    const photo = req.body.photo;

    // Validate inputs
    if (!specialityName || !photo) {
      return res
        .status(400)
        .json({ message: "Please add valid Speciality and image" });
    }

    // Additional validation for specialityName: No spaces allowed
    if (specialityName.includes(" ")) {
      return res
        .status(400)
        .json({ message: "Speciality name cannot contain spaces" });
    }

    const existing = await Speciality.findOne({
      speciality: { $regex: new RegExp("^" + specialityName + "$", "i") },
    });

    if (existing) {
      return res.status(400).json({ message: "Speciality already exists" });
    }

    // Add validation for photo URL, if needed

    const photoResult = await cloudinary.uploader.upload(photo, {
      folder: "specialitysvg",
    });

    const newSpeciality = new Speciality({
      speciality: specialityName,
      photo: photoResult.secure_url, // Save the URL or any identifier you need
    });

    await newSpeciality.save();

    res
      .status(200)
      .json({ success: true, message: "Speciality added successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const specialityList = async (req, res) => {
  try {
    const { limit, currentPage } = req.query;

    const page = parseInt(currentPage);
    const lim = parseInt(limit);

    const startIndex = (page - 1) * lim;

    const totalItems = await Speciality.countDocuments();
    const data = await Speciality.find()
      .skip(startIndex)
      .limit(lim)
      .sort({ speciality: 1 });

    const results = {
      data: data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / lim),
        totalItems: totalItems,
      },
    };

    res.status(200).json(results);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const listUnlist = async (req, res) => {
  try {
    const { id } = req.query;
    const data = await Speciality.findById(id);

    if (data.list) {
      data.list = false;
    } else {
      data.list = true;
    }

    await data.save();
    res.status(200).json({ message: "Successfull" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const editSpeciality = async (req, res) => {
  try {
    const id = req.body.id;
    const editedName = req.body.edit;
    const photo = req.body.photo;

    if (!id || !editedName) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const existing = await Speciality.findOne({
      speciality: { $regex: new RegExp("^" + editedName + "$", "i") },
    });

    if (existing) {
      if (photo) {
        const photoResult = await cloudinary.uploader.upload(photo, {
          folder: "specialitysvg",
        });
        photoUrl = photoResult.secure_url;
      }
      return res.status(400).json({ message: "Speciality already exists" });
    }

    let photoUrl;

    if (photo) {
      const photoResult = await cloudinary.uploader.upload(photo, {
        folder: "specialitysvg",
      });
      photoUrl = photoResult.secure_url;
    }

    const data = await Speciality.findOneAndUpdate(
      { _id: id },
      { speciality: editedName, ...(photoUrl && { photo: photoUrl }) },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Speciality updated successfully",
      data,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

//doctor
const unVerifiedList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const totalItems = await Doctor.countDocuments();
    const doctors = await Doctor.find({
      otp_verified: true,
      admin_verify: false,
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const results = {
      doctors: doctors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems: totalItems,
      },
    };
    res.status(200).json(results);
  } catch (error) {
    console.log(error.message);
  }
};

const unVerifiedDetails = async (req, res) => {
  try {
    const { id } = req.query; // Retrieve from query parameters
    const details = await Doctor.findOne({ _id: id });
    res.status(200).json({ details });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const adminVerify = async (req, res) => {
  try {
    const { id } = req.query;
    const doctor = await Doctor.findById(id);
    const verified = doctor.admin_verify;

    if (verified === false) {
      doctor.admin_verify = true;
      await doctor.save();
      return res.status(200).json({ doctor });
    } else {
      return res.status(400).json({ message: "Doctor is already verified" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const doctorList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const totalItems = await Doctor.countDocuments();

    const doctors = await Doctor.find({
      admin_verify: true,
      otp_verified: true,
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const results = {
      doctors: doctors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems: totalItems,
      },
    };

    res.status(200).json(results);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const doctorDetails = async (req, res) => {
  
  console.log('test 1');
  try {
      const { id } = req.body
      const details = await Doctor.findOne({ _id: id })
      res.status(200).json({ details })

  } catch (error) {
      console.log(error.message)
      res.status(500).json({ message: 'Internal Server Error' });
  }
}

const blockApprove = async (req, res) => {
  try {
      const { id } = req.body
      const doctor = await Doctor.findOne({ _id: id })
      const blocked = doctor.is_blocked

      if (blocked) {
          doctor.is_blocked = false;
          await doctor.save();
      } else {
          doctor.is_blocked = true;
          await doctor.save();
      }
      res.status(200).json({ doctor });

  } catch (error) {
      console.log(error.message)
      res.status(500).json({ message: 'Internal Server Error' });

  }
}

module.exports = {
  login,
  usersList,
  userDetails,
  blockUnblock,
  addSpeciality,
  specialityList,
  listUnlist,
  editSpeciality,
  unVerifiedList,
  unVerifiedDetails,
  adminVerify,
  doctorList,
  doctorDetails,
  blockApprove
};
