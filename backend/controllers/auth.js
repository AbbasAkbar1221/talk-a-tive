const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat-app-profiles",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
  }
});

// Setup Multer with Cloudinary storage
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

const registerUser = async(req, res) => {
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
    
    const picUrl = req.file ? req.file.path : "";
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      pic: picUrl, 
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

  const userInfo = { _id: user.id, name: user.name, email: user.email, pic: user.pic };
  const token_data = { userInfo };

  const token = generateToken(token_data);

res.json({
  _id: user._id,
  name: user.name,
  email: user.email,
  pic: user.pic,
  token
});
}
function generateToken(data) {
  return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
}
const logoutUser = async (req, res) => {
    return res.status(200).json({ message: 'User logged out successfully!' });
};
module.exports = { 
  registerUser,
  loginUser,
  logoutUser,
  upload
};