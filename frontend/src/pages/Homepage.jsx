import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../context/ChatContext';
import { useEffect } from 'react';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isLoading } = ChatState();

  useEffect(() => {
    if (isLoading) return; 

    if (user) {
      navigate('/chats');
    } else {
      navigate('/login');
    }
  }, [user, navigate, isLoading]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-lg">
        {isLoading ? "Loading..." : "Redirecting..."}
      </div>
    </div>
  );
};

export default HomePage;