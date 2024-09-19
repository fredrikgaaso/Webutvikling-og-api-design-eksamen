import express, { Router } from "express";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cookie from "cookie";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { chatApi, ChatRouter } from "./chatApi.js";
import fetch from "node-fetch";
import { WebSocketServer } from "ws";

dotenv.config();

const Chats = new Router();
const app = express();
const wsServer = new WebSocketServer({ noServer: true });
const server = app.listen(process.env.PORT || 3000);
const sockets = [];
const cookieSecret = process.env.COOKIE_SECRET;

app.use(bodyParser.json());
app.use(cookieParser(cookieSecret));

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Failed: ${res.status}`);
  } else {
    return await res.json();
  }
}

app.use("/api/chat", chatApi);

const mongoClient = new MongoClient(process.env.MONGODB_URL);
mongoClient.connect().then((connection) => {
  const db = connection.db("PG6301");
  ChatRouter(db);
});

app.get("/api/login", async (req, res) => {
  const { access_token } = req.signedCookies;

  try {
    const openidResponse = await fetch(
      "https://accounts.google.com/.well-known/openid-configuration",
    );
    if (!openidResponse.ok) {
      throw new Error(
        `Failed to fetch OpenID configuration: ${openidResponse.status} ${openidResponse.statusText}`,
      );
    }
    const { userinfo_endpoint } = await openidResponse.json();

    const userinfoResponse = await fetchJSON(userinfo_endpoint, {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });
    res.json(userinfoResponse);
  } catch (error) {
    console.error("Error fetching user information:", error);
    res.status(500).json({ error: "Error fetching user information:" });
  }
});

app.delete("/api/login", (req, res, next) => {
  res.clearCookie("access_token");
  res.clearCookie("username");
  res.sendStatus(200);
});
app.post("/api/login", async (req, res, next) => {
  const { access_token } = req.body;

  try {
    const openidResponse = await fetch(
      "https://accounts.google.com/.well-known/openid-configuration",
    );
    if (!openidResponse.ok) {
      throw new Error(
        `Failed to fetch OpenID configuration: ${openidResponse.status} ${openidResponse.statusText}`,
      );
    }

    const { userinfo_endpoint } = await openidResponse.json();

    const userinfoResponse = await fetchJSON(userinfo_endpoint, {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    const username = userinfoResponse.name;

    if (!username) {
      res.sendStatus(401);
    } else {
      res.cookie("access_token", access_token, { signed: true });
      res.cookie("username", username, { signed: true });
      res.sendStatus(200);
    }
  } catch (error) {
    console.error("Error fetching user information:", error);
    res.status(500).json({ error: "Error fetching user information:" });
  }
});
app.use(express.static("../client/dist"));
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api/")) {
    return res.sendFile(path.resolve("../client/dist/index.html"));
  } else {
    next();
  }
});

console.log(`listening on http://localhost:${server.address().port}`);
server.on("upgrade", (req, socket, head) => {
  const cookies = cookie.parse(req.headers.cookie);
  const signedCookies = cookieParser.signedCookies(cookies, cookieSecret);
  const { username } = signedCookies;

  wsServer.handleUpgrade(req, socket, head, (socket) => {
    sockets.push(socket);
    setTimeout(() => {});

    socket.on("message", (buffer) => {
      const message = buffer.toString();
      for (const s of sockets) {
        s.send(
          JSON.stringify({
            username,
            message,
          }),
        );
      }
    });
  });
});
