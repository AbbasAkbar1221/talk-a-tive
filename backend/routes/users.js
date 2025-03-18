const express = require('express');
const router = express.Router();
const { allUsers, fetchUserDetails } = require('../controllers/users');

router.get('/', allUsers); 
router.get('/userdetails', fetchUserDetails);
module.exports = router;