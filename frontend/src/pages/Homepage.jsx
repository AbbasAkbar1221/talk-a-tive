import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../context/ChatContext';
const HomePage = () => {
  const navigate = useNavigate();
  const { user } = ChatState(); 

  useEffect(() => {
    if (user === undefined) return; 

    if (user) {
      navigate('/chats');
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div>Redirecting...</div>
    </div>
  );
};
export default HomePage