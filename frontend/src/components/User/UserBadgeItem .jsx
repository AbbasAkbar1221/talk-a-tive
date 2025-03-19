import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <div className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center text-sm">
      {user.name}
      <button className="ml-1 focus:outline-none" onClick={handleFunction}>
        <AiOutlineClose size={12} />
      </button>
    </div>
  );
};

export default UserBadgeItem;