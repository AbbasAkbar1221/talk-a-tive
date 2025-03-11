require("dotenv").config();
const express = require("express");
const app = express();
require("./config/connection");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const authenticateToken = require("./middleware/authMiddleware");
const usersRoutes = require("./routes/users");
const chatsRoutes = require("./routes/chats");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);

app.use(authenticateToken);
app.use("/api/users", usersRoutes);
app.use("/api/chats", chatsRoutes);


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
