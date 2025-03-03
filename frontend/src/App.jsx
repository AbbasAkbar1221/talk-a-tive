import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Chatpage from "./pages/Chatpage";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chats" element={<Chatpage/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
