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

// router.get("/", (req, res) => {
//   res.send(chats);
// });

// router.get("/:id", (req, res) => {
//   const singleChat = chats.find((chat) => chat._id === req.params.id);
//   res.send(singleChat);
// });

module.exports = router;
