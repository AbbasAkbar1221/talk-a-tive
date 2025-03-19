import React from "react";
import { ChatState } from "../context/ChatContext";
import SideDrawer from "../components/Chats/SideDrawer";
import MyChats from "../components/Chats/MyChats";
import ChatBox from "../components/Chats/ChatBox";

const Chatpage = () => {
  const { user, selectedChat } = ChatState();

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {user && <SideDrawer />}
      <div className="flex w-full h-[91vh] p-4 md:p-10">
        <div className={`${selectedChat ? "hidden" : "block"} w-full md:block md:w-1/3`}>
          {user && <MyChats />}
        </div>
        <div className={`${selectedChat ? "block" : "hidden"} w-full md:block md:w-2/3`}>
          {user && <ChatBox />}
        </div>
      </div>
    </div>
  );
};

export default Chatpage;
