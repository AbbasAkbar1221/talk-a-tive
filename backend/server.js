require("dotenv").config();
const express = require("express");
const chats = require("./data/data");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/chats", (req, res) => {
  res.send(chats);
});

app.get("/api/chats/:id", (req, res) => {
    const singleChat = chats.find((chat) => chat._id === req.params.id);
    res.send(singleChat);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
