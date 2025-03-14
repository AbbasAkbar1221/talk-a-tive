import { IoMdClose } from "react-icons/io";

const ProfileModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">

        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold">Profile</h2>
          <IoMdClose size={24} className="cursor-pointer" onClick={onClose} />
        </div>

        <div className="flex flex-col items-center mt-4">
          <img src={user.pic} alt="Profile" className="w-24 h-24 rounded-full border" />
          <h3 className="text-xl font-medium mt-2">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <button
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
