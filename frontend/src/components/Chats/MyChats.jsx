import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChatState } from "../../context/ChatContext";
import { AiOutlinePlus } from "react-icons/ai";
import GroupChatModal from "./GroupChatModal";

const MyChats = () => {
  const [loading, setLoading] = useState(true);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const { user, selectedChat, setSelectedChat, chats, setChats, socket } = ChatState();
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (socket) {
      const handleGroupRenamed = (updatedChat) => {
        setSelectedChat((prevChat) => {
          if (prevChat && prevChat._id === updatedChat._id) {
            return updatedChat;
          }
          return prevChat;
        });

        setChats((prevChats) => {
          if (!prevChats) return [];
          return prevChats.map((chat) =>
            chat?._id === updatedChat?._id ? { ...chat, ...updatedChat } : chat
          );
        });
      };

      socket.on("group renamed", handleGroupRenamed);
      
      return () => {
        socket.off("group renamed", handleGroupRenamed);
      };
    }
  }, [socket, setSelectedChat, setChats]);

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
  }, [chats]);

  const getSenderName = (chat) => {
    if (!chat.users || chat.users.length === 0) return "Unknown User";
    return chat.users[0]._id === user._id
      ? chat.users[1]?.name || "Unknown User"
      : chat.users[0]?.name || "Unknown User";
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-2 md:mb-4 px-2">
        <h1 className="text-xl md:text-2xl font-semibold">My Chats</h1>
        <button
          className="bg-blue-500 text-white px-2 py-1 md:px-3 md:py-2 rounded-lg flex items-center gap-1 hover:bg-blue-600 text-sm md:text-base"
          onClick={() => setIsGroupModalOpen(true)}
        >
          <AiOutlinePlus size={16} />
          <span className="hidden sm:inline">New Group Chat</span>
          <span className="sm:hidden">New Group</span>
        </button>
      </div>
      
      <div className="flex-1 border rounded-lg p-2 md:p-4 bg-white shadow-md overflow-y-auto max-h-[calc(100vh-200px)]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        ) : chats.length > 0 ? (
          chats.map((chat) => (
            <div
              key={chat._id}
              className={`p-2 md:p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                selectedChat?._id === chat._id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <div>
                {chat.isGroupChat ? (
                  <p className="font-medium truncate">{chat?.chatName || "Unnamed Group" }</p>
                ) : (
                  <p className="font-medium truncate">{getSenderName(chat)}</p>
                )}
                {chat.latestMessage && (
                  <p className={`text-xs md:text-sm truncate ${selectedChat?._id === chat._id ? "text-blue-100" : "text-gray-500"}`}>
                    <span className="font-medium">
                      {chat.latestMessage?.sender?.name === user.name ? "You: " : `${chat.latestMessage?.sender?.name || "Unknown"}: `}
                    </span>
                    {chat.latestMessage?.content || ""}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-center">No chats available</p>
          </div>
        )}
      </div>
      
      <GroupChatModal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)} 
      />
    </div>
  );
};

export default MyChats;
