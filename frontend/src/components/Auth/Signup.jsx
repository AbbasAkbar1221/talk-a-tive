import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    pic: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_API_URL;
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'pic') {
      const file = files[0];
      setFormData(prev => ({
        ...prev, 
        pic: file
      }));

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({
        ...prev, 
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const uploadData = new FormData();
    uploadData.append('name', formData.name);
    uploadData.append('email', formData.email);
    uploadData.append('password', formData.password);
    uploadData.append("confirmPassword", formData.confirmPassword);

    if (formData.pic) {
      uploadData.append('pic', formData.pic);
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/register`, 
        uploadData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setLoading(false);
      navigate("/login");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Signup</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full p-2 border border-gray-300 rounded"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full p-2 border border-gray-300 rounded"
            onChange={handleChange}
            required
          />
          
          <div className="flex items-center space-x-4">
            <input
              type="file"
              name="pic"
              accept="image/*"
              className="w-full p-2 border border-gray-300 rounded"
              onChange={handleChange}
            />
            {previewImage && (
              <img 
                src={previewImage} 
                alt="Profile Preview" 
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;