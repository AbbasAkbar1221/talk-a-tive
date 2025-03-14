import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { ChatState } from "../context/ChatContext";
import SideDrawer from "../components/Chats/SideDrawer";
import MyChats from "../components/Chats/MyChats";
import ChatBox from "../components/Chats/ChatBox";

const Chatpage = () => {
  const {user} = ChatState();
  const [chats, setChats] = useState([]);

  return <div style={{ width: "100%"}}>
        {user && <SideDrawer/>}
        <div className="flex justify-between w-[100%] h-[91vh] p-10">
          {user && <MyChats/>}
          {user && <ChatBox/>}
        </div>
  </div>;
};

export default Chatpage;
