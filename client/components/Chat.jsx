import React, { useEffect, useRef, useState } from "react";
import { fetchJSON } from "./http";
import { useLoader } from "./useLoader";
import { Link, useNavigate } from "react-router-dom";

export function ChatApplication({ username }) {
  async function addToDB(newChatLog) {
    const [chatEntry] = newChatLog;
    console.log(chatEntry);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(chatEntry),
      });
    } catch (error) {
      console.error("Error adding message to the server:", error);
    }
  }

  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const {
    loading,
    error: messageError,
    data: message,
  } = useLoader(async () => fetchJSON("/api/chat"));

  const { data: user, error: missingUser } = useLoader(async () =>
    fetchJSON("/api/login"),
  );

  const [webSocket, setWebSocket] = useState();

  useEffect(() => {
    const webSocket = new WebSocket(
      window.location.origin.replace(/^http/, "ws"),
    );
    webSocket.onmessage = (event) => {
      setMessages((current) => [...current, JSON.parse(event.data)]);
    };
    setWebSocket(webSocket);
  }, []);
  username = user?.name;

  function handleNewMessage(event) {
    event.preventDefault();
    try {
      webSocket.send(newMessage);
      addToDB([{ username, newMessage }]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message via WebSocket:", error);
    }
  }
  if (loading) {
    return (
      <main>
        <div>Loading...</div>
      </main>
    );
  }
  if (messageError) {
    return (
      <main>
        <div>
          An error occurred while fetching messages: {messageError.toString()}
        </div>
      </main>
    );
  }

  return (
    <div>
      <header>
        {" "}
        <h1>Welcome to the chat-room! {username}</h1>
      </header>
      <main>
        {" "}
        <ul id={"chat"}>
          {message.map((chat, index) => (
            <li key={index}>
              <strong>{chat.username}: </strong>
              {chat.message}
            </li>
          ))}
          {messages.map(({ username, message }, index) => (
            <li key={index}>
              <strong>{username}:</strong> {message}
            </li>
          ))}
        </ul>
        <form onSubmit={handleNewMessage}>
          <input
            autoFocus
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type={"submit"}>Send message</button>
        </form>
      </main>
      <footer>
        <Link to={"/login/menu"}>
          <button>Go back</button>
        </Link>
      </footer>
    </div>
  );
}
