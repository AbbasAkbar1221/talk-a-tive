const express = require("express");
const router = express.Router();
const chats = require("../data/data");
const { accessChat, fetchChats, createGroupChat, renameGroup, removeUserFromGroup, addUserToGroup} = require("../controllers/chats");

router.post('/', accessChat);
router.get('/', fetchChats);

router.post('/group', createGroupChat);
router.put('/group/rename', renameGroup);
router.put('/group/remove', removeUserFromGroup);
router.put('/group/add', addUserToGroup);

module.exports = router;
