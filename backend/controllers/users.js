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

module.exports = { allUsers };
