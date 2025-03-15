import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Chatpage from "./pages/Chatpage";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import HomePage from "./pages/Homepage";
import { ChatState } from "./context/ChatContext";

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = ChatState();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const { user } = ChatState();
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <Chatpage />
             </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;