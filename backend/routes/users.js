const express = require('express');
const router = express.Router();
const { allUsers } = require('../controllers/users');

router.get('/', allUsers);   
module.exports = router;