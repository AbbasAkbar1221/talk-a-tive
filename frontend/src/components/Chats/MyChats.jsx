import React, { useEffect, useState, forwardRef } from "react";
import axios from "axios";
import { ChatState } from "../../context/ChatContext";
import { AiOutlinePlus } from "react-icons/ai";
import GroupChatModal from "./GroupChatModal";

const MyChats = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(true);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }
      const res = await axios.get(`${BACKEND_URL}/api/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setChats(res.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Function to get other user's name in 1-on-1 chat
  const getSenderName = (chat) => {
    if (!chat.users || chat.users.length === 0) return "Unknown User";
    return chat.users[0]._id === user._id
      ? chat.users[1]?.name || "Unknown User"
      : chat.users[0]?.name || "Unknown User";
  };

  return (
    <div ref={ref} className="w-full p-4 md:w-1/3">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">My Chats</h1>
        <button
          className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-blue-600"
          onClick={() => setIsGroupModalOpen(true)}
        >
          <AiOutlinePlus size={18} />
          <span>New Group Chat</span>
        </button>
      </div>
      
      <div className="border rounded-lg p-4 bg-white shadow-md h-[70vh] overflow-y-auto">
        {loading ? (
          <p className="text-gray-500 text-center">Loading chats...</p>
        ) : chats.length > 0 ? (
          chats.map((chat) => (
            <div
              key={chat._id}
              className={`p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                selectedChat?._id === chat._id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <div>
                {chat.isGroupChat ? (
                  <p className="font-medium">{chat.chatName}</p>
                ) : (
                  <p className="font-medium">{getSenderName(chat)}</p>
                )}
                {chat.latestMessage && (
                  <p className={`text-sm truncate ${selectedChat?._id === chat._id ? "text-blue-100" : "text-gray-500"}`}>
                    <span className="font-medium">
                      {chat.latestMessage.sender.name === user.name ? "You: " : `${chat.latestMessage.sender.name}: `}
                    </span>
                    {chat.latestMessage.content}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No chats available</p>
        )}
      </div>
      
      {/* Group Chat Modal */}
      <GroupChatModal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)} 
      />
    </div>
  );
});

export default MyChats;
