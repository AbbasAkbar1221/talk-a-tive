require("dotenv").config();

const User = require("../models/userModel");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const isValid = allowedTypes.includes(file.mimetype);

  cb(isValid ? null : new Error("Invalid file type. Only images are allowed."), isValid);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

const registerUser = async(req, res) =>{
  try {
    const { name, password, email, confirmPassword } = req.body;
    if (!name || !password || !email || !confirmPassword) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const pic = req.file ? req.file.filename : ""; 
    const user = new User({
      name,
      email,
      password: hashedPassword,
      pic,
    });
    
    await user.save();
    res.json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const loginUser = async(req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).json({ message: "Incorrect email" });
  }
  try {
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(400).json({ message: "Incorrect password" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  const userInfo = { _id: user.id, name: user.name };
  const token_data = { userInfo };

  const token = generateToken(token_data);

  return res.json({ token });
}

function generateToken(data) {
  return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
}
const logoutUser = async (req, res) => {
    return res.status(200).json({ message: 'User logged out successfully!' });
};

module.exports = { registerUser, loginUser, logoutUser, upload };