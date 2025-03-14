require("dotenv").config();
const User = require("../models/userModel");

const allUsers = async (req, res) => {
  const keyword = req.query.search ? {
    $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
    ]
  }: {};
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.json(users);
};

async function fetchUserDetails (req, res){
  try {
    const user = req.user;
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

module.exports = { allUsers, fetchUserDetails };
