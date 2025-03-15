import { useEffect, useRef, useState } from "react";
import { AiOutlineSearch, AiOutlineBell } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";
import { ChatState } from "../../context/ChatContext";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserListItem from "../User/UserListItem";

const SideDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const { user, setSelectedChat, chats, setChats, logout } = ChatState();
  const navigate = useNavigate();
  const dropDownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const token = localStorage.getItem("token");
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const handleSearch = async () => {
    if (!search) {
      console.log("Please enter a search query");
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${BACKEND_URL}/api/users?search=${search}`,
        config
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/chats`,
        { userId },
        config
      );
      if (!chats.find((chat) => chat._id === response.data._id)) {
        setChats([response.data, ...chats]);
      }
      setSelectedChat(response.data);
      setIsOpen(false);
    } catch (error) {
      console.error("Error accessing chat:", error);
    } finally {
      setLoadingChat(false);
    }
  };

 useEffect(() => {
   const handleClickOutside = (e) => {
      if(dropDownRef.current && !dropDownRef.current.contains(e.target)){
        setShowDropdown(false);
      }
   }

   if(showDropdown){
      document.addEventListener('mousedown', handleClickOutside);
    }
 
   return () => {
     document.removeEventListener('mousedown', handleClickOutside);
   }
 }, [showDropdown])
 

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 shadow-md relative">
        {/* Search Bar */}
        <div
          className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <AiOutlineSearch className="text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search..."
            className="outline-none w-32 sm:w-64 bg-transparent"
            readOnly
          />
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold">Talk-A-Tive</h1>

        {/* Notifications & Profile */}
        <div className="flex items-center gap-4 relative">
          <AiOutlineBell className="text-gray-600 cursor-pointer" size={24} />
          <div className="relative" ref={dropDownRef}>
            <img
              src={user?.pic   || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
              alt="User Avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-lg overflow-hidden">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setIsProfileOpen(true);
                    setShowDropdown(false);
                  }}
                >
                  Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side Drawer */}
      {isOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-xs flex">
          <div className="w-80 bg-white h-full p-4 shadow-lg">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-semibold">Search Users</h2>
              <IoMdClose
                size={24}
                className="cursor-pointer"
                onClick={() => setIsOpen(false)}
              />
            </div>

            {/* Search Input */}
            <div className="mt-4">
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="w-full bg-blue-500 text-white rounded-lg py-2 mt-2"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>

            <div className="mt-4">
              {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
              ) : (
                searchResults.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => accessChat(user._id)}
                  />
                ))
              )}
              {loadingChat && (
                <div className="flex justify-center mt-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {isProfileOpen && (
        <ProfileModal user={user} onClose={() => setIsProfileOpen(false)} />
      )}
    </>
  );
};

export default SideDrawer;
