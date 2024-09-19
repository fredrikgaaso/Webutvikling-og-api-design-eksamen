import express, { Router } from "express";
export const chatApi = express.Router();

export function ChatRouter(db) {
  chatApi.get("", async (req, res) => {
    const chatMessages = await db.collection("Chats").find().toArray();
    res.json(chatMessages);
  });

  chatApi.post("", async (req, res) => {
    const { newMessage, username } = req.body;
    const message = newMessage;
    console.log(username, newMessage);
    await db.collection("Chats").insertOne({
      username,
      message,
    });
    res.sendStatus(204);
  });
}
