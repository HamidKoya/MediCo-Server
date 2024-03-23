const mongoose = require("mongoose");
const Connection = async () => {
    try {
      const URL = process.env.MONGO_URI;
      mongoose.set("strictQuery", false);
      await mongoose.connect(URL);
      console.log("Database connected successfully");
    } catch (error) {
      console.log(error);
    }
};

module.exports = Connection