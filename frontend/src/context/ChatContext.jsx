import { useNavigate } from "react-router-dom";
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user) {
      const newSocket = io(BACKEND_URL);
      setSocket(newSocket);
    }
  }, [user]);

  const fetchUserDatails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const userInfo = await axios.get(`${BACKEND_URL}/api/users/userdetails`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(userInfo.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchUserDatails();
  }, []);

  return (
    <ChatContext.Provider value={{ user, setUser, selectedChat, setSelectedChat, chats, setChats, socket }}>
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
