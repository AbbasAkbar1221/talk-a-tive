import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChatState } from "../../context/ChatContext";
import { BsArrowLeftCircle } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import { AiOutlineEdit, AiOutlineCheck } from "react-icons/ai";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { user, selectedChat, setSelectedChat, socket, isLoading } =
    ChatState();
  const BACKEND_URL = import.meta.env.VITE_API_URL;
  const messageEndRef = useRef(null);
  const [selectedChatName, setSelectedChatName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const token = localStorage.getItem("token");

  if (isLoading || !socket) {
    return <div className="flex-1 flex items-center justify-center p-4">Connecting to chat server...</div>;
  }

  useEffect(() => {
    if (selectedChat) {
      setSelectedChatName(selectedChat.chatName);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (socket && selectedChat) {
      socket.on("connected", () => setSocketConnected(true));
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));
      socket.emit("join chat", selectedChat._id);
    }

    return () => {
      if (socket && selectedChat) {
        socket.emit("stop typing", selectedChat._id);
      }
    };
  }, [selectedChat, socket]);

  // Fetch messages when chat changes
  useEffect(() => {
    if (socket && selectedChat) {
      fetchMessages();
      socket.emit("join chat", selectedChat._id);
    }
    return () => {
      if (socket && selectedChat) {
        socket.emit("stop typing", selectedChat?._id);
      }
    };
  }, [selectedChat]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;
    
    const handleMessageReceived = (newMessageReceived) => {
      if (selectedChat && selectedChat._id === newMessageReceived.chat._id) {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    };
    
    socket.on("message received", handleMessageReceived);
    
    return () => {
      socket.off("message received", handleMessageReceived);
    };
  }, [selectedChat, socket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleRenameGrp = async () => {
    if (!selectedChat || !selectedChatName.trim()) {
      alert("Enter a valid group name");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(
        `${BACKEND_URL}/api/chats/group/rename`,
        {
          chatId: selectedChat._id,
          chatName: selectedChatName,
        },
        config
      );
      
      setSelectedChat(data);
      setIsEditing(false);
      
      if (socket) {
        socket.emit("group renamed", data);
      }
      
    } catch (error) {
      console.error("Error renaming group:", error);
      alert("Failed to rename group");
      setSelectedChatName(selectedChat.chatName);
    }
  };


  useEffect(() => {
    if (!socket) return;
    const handleGroupRenamed = (updatedChat) => {
      setSelectedChat((prevChat) => {
        if (prevChat && prevChat._id === updatedChat._id) {
          return updatedChat;
        }
        return prevChat;
      });
    };

    socket.on("group renamed", handleGroupRenamed);

    return () => {
      socket.off("group renamed", handleGroupRenamed);
    };
  }, [socket]);


  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const { data } = await axios.get(
        `${BACKEND_URL}/api/messages/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (socket && selectedChat) {
      socket.emit("stop typing", selectedChat._id);
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      setNewMessage("");
      const { data } = await axios.post(
        `${BACKEND_URL}/api/messages`,
        {
          content: newMessage,
          chatId: selectedChat._id,
        },
        config
      );

      socket.emit("new message", data);
      setMessages([...messages, data]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  // Function to get other user's name in 1-on-1 chat
  const getSenderName = (chat) => {
    return chat.users[0]._id === user._id
      ? chat.users[1].name
      : chat.users[0].name;
  };

  // Function to get other user's picture in 1-on-1 chat
  const getSenderPic = (chat) => {
    return chat.users[0]._id === user._id
      ? chat.users[1].pic
      : chat.users[0].pic;
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg p-4">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md overflow-hidden h-full">
      
      <div className="bg-gray-100 p-3 flex items-center justify-between border-b">
        <div className="flex items-center overflow-hidden">
          <button
            className="md:hidden mr-2 text-gray-600"
            onClick={() => setSelectedChat(null)}
          >
            <BsArrowLeftCircle size={24} />
          </button>

          {selectedChat.isGroupChat ? (
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="border p-1 rounded-md w-full"
                    value={selectedChatName}
                    onChange={(e) => setSelectedChatName(e.target.value)}
                    onBlur={handleRenameGrp}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRenameGrp();
                      }
                    }}
                    autoFocus
                  />
                  <button onClick={handleRenameGrp}>
                    <AiOutlineCheck
                      className="text-blue-500 cursor-pointer"
                      size={20}
                    />
                  </button>
                </div>
              ) : (
                <h3 className="font-semibold text-lg flex items-center gap-2 truncate">
                  {selectedChat?.chatName || "Group Chat"}
                  <AiOutlineEdit
                    className="cursor-pointer text-gray-500 hover:text-black flex-shrink-0"
                    onClick={() => setIsEditing(true)}
                    size={18}
                  />
                </h3>
              )}

              <div className="text-xs text-gray-500 truncate">
                {selectedChat.users.length} members
                <div className="truncate">
                  {selectedChat.users.map((u, index) => (
                    <span key={u._id} className="text-xs">
                      {u._id === user._id ? "You" : u.name}
                        {index === selectedChat.users.length - 1 ? "" : ", "}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center overflow-hidden">
              <img
                src={
                  getSenderPic(selectedChat) ||
                  "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                }
                alt="Profile"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2 md:mr-3 flex-shrink-0"
              />
              <h3 className="font-semibold text-lg truncate">
                {getSenderName(selectedChat)}
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-2 md:p-4 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.sender._id === user._id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 ${
                    message.sender._id === user._id
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {selectedChat.isGroupChat ? (
                    message.sender._id !== user._id ? (
                      <div className="text-xs font-semibold">
                        {message.sender.name}
                      </div>
                    ) : (
                      <div className="text-xs font-semibold">You</div>
                    )
                  ) : null}

                  <div className="break-words flex justify-end items-center gap-2">
                    {message.content}
                    <div
                      className={`text-xs text-right mt-1 ${
                        message.sender._id === user._id
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center text-gray-500">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="ml-2 text-sm">typing...</span>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-2 md:p-4 border-t">
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={typingHandler}
            placeholder="Type a message..."
            className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white rounded-r-lg px-3 py-2 disabled:bg-blue-300"
          >
            <IoSend size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;