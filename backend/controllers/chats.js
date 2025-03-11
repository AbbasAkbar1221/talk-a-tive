const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId)
    return res.status(400).json({ message: "Please provide user id" });

    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: userId } } },
        { users: { $elemMatch: { $eq: req.user._id } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      return res.json(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [userId, req.user._id],
      };

      try {
        const createdChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({_id: createdChat._id})
        .populate("users", "-password")
        res.status(200).json(fullChat);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
};

const fetchChats = async(req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async(results) => {
            results = await User.populate(results, {
                path: "latestMessage.sender",
                select: "name pic email",
              });
                res.status(200).json(results);
        } )

    } catch (error) {
        res.status(500).json({ message: error.message});
    }
}

const createGroupChat = async(req, res) => {
    if(!req.body.users || !req.body.name) {
        return res.status(400).json({ message: "Please fill the fields" });
    }
    var users = JSON.parse(req.body.users);
    if(users.length < 2){
        return res.status(400).json({ message: "More than two users are required for group chat" });
    }
    users.push(req.user);
    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            isGroupChat: true,
            users: users,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const renameGroup = async(req, res) => {
    const { chatId, chatName } = req.body;
    if(!chatId || !chatName) {
        return res.status(400).json({ message: "Please provide chat id and chat name" });
    }
    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            { _id: chatId },
            { chatName: chatName },
            { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
        res.status(200).json(updatedChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeUserFromGroup = async(req, res) => {
    const { chatId, userId } = req.body;
    if(!chatId || !userId) {
        return res.status(400).json({ message: "Please provide chat id and user id" });
    }
    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            { _id: chatId },
            { $pull: { users: userId } },
            { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
        res.status(200).json(updatedChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addUserToGroup = async(req, res) => {
    const { chatId, userId } = req.body;
    if(!chatId || !userId) {
        return res.status(400).json({ message: "Please provide chat id and user id" });
    }
    try {
        const added = await Chat.findByIdAndUpdate(
            { _id: chatId },
            { $push: { users: userId } },
            { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
        if(!added) {
            return res.status(400).json({ message: "User already exists in the group" });   
        }
        res.status(200).json(added);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, removeUserFromGroup, addUserToGroup };