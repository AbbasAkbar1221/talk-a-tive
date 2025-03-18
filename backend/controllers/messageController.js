const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');

const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;
  
  if (!content || !chatId) {
    return res.status(400).json({ message: 'Please provide content and chat ID' });
  }
  
  try {
    let message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
    });
    
    message = await message.populate('sender', 'name pic');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name pic email',
    });
    
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name pic email')
      .populate('chat');
    
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendMessage, allMessages };