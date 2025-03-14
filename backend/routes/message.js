// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { sendMessage, allMessages } = require('../controllers/messageController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.route('/').post(sendMessage);
router.route('/:chatId').get(allMessages);

module.exports = router;