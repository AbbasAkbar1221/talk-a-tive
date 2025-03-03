import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

const Chatpage = () => {
  const BACKEND_URL = import.meta.env.VITE_API_URL;
  const [chats, setChats] = useState([]);
  const fetchChats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/chats`);
      console.log(response.data);
      setChats(response.data);
    } catch (error) {
        console.error(error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [])
  
  return <div>
        <h1>Chatpage</h1>
        <div>
            {chats.map((chat) => (
                <div key={chat._id}>
                    <h2>{chat.chatName}</h2>
                </div>
            ))}
        </div>
  </div>;
};

export default Chatpage;
