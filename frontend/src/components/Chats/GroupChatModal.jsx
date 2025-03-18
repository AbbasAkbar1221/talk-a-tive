import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import axios from 'axios';
import { ChatState } from '../../context/ChatContext';
import UserListItem from '../User/UserListItem';
import UserBadgeItem from '../User/UserBadgeItem ';

const GroupChatModal = ({ isOpen, onClose }) => {
  const [groupChatName, setGroupChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  
  const { user, chats, setChats } = ChatState();
  const BACKEND_URL = import.meta.env.VITE_API_URL;
  
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      const { data } = await axios.get(
        `${BACKEND_URL}/api/users?search=${query}`,
        config
      );
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupChatName || selectedUsers.length < 2) {
      alert('Please fill all fields and select at least 2 users');
      return;
    }
    
    try {
      setCreateLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      const { data } = await axios.post(
        `${BACKEND_URL}/api/chats/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map(u => u._id)),
        },
        config
      );
      
      setChats([data, ...chats]);
      onClose();
      setGroupChatName('');
      setSelectedUsers([]);
      setSearch('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error creating group chat:', error);
      alert('Failed to create group chat');
    } finally {
      setCreateLoading(false);
    }
  };
  
  const handleUserSelect = (userToAdd) => {
    if (selectedUsers.some(user => user._id === userToAdd._id)) {
      return; 
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };
  
  const handleUserRemove = (userToRemove) => {
    setSelectedUsers(
      selectedUsers.filter(user => user._id !== userToRemove._id)
    );
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Group Chat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <AiOutlineClose size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Group Name</label>
            <input
              type="text"
              value={groupChatName}
              onChange={(e) => setGroupChatName(e.target.value)}
              placeholder="Enter group name"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Add Users</label>
            <input
              type="text"
              placeholder="Search users by name or email"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedUsers.map(user => (
              <UserBadgeItem 
                key={user._id} 
                user={user} 
                handleFunction={() => handleUserRemove(user)} 
              />
            ))}
          </div>
          
          <div className="max-h-40 overflow-y-auto mb-4">
            {loading ? (
              <div className="flex justify-center p-2">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
              </div>
            ) : (
              searchResults
                .filter(searchUser => !selectedUsers.some(selectedUser => selectedUser._id === searchUser._id))
                .map(user => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleUserSelect(user)}
                  />
                ))
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center"
            disabled={createLoading}
          >
            {createLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
            ) : null}
            Create Group Chat
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChatModal;