const UserListItem = ({ user, handleFunction }) => {
    return (
      <div
        className="flex items-center gap-4 p-3 border-b cursor-pointer hover:bg-gray-100"
        onClick={handleFunction}
      >
        <img
          src={user?.pic}
          alt="User Avatar"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h3 className="text-md font-semibold">{user?.name}</h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>
    );
  };
  
  export default UserListItem;
  
