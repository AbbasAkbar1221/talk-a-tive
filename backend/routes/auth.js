const express = require('express');
const router = express.Router();

const {registerUser, loginUser, logoutUser, upload} = require('../controllers/auth');

if (!upload) {
    console.error("Error: `upload` is not defined in authController.js");
  }

router.post('/register', upload.single("pic"), registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

module.exports = router;