// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const routes = require("./src/routes/ApiController"); // Import the routes directly
const path = require("path");
const {
  SessionManager,
  SessionConfig,
  PipeFactory,
  PlayerFactory,
  SessionSettings,
} = require("./SessionManager");
const { Vector } = require("./src/Models");
const { v4: uuidv4 } = require("uuid");
const { hostname } = require("os");
const DatabaseService = require("./src/service/DatabaseService");
const jwt = require("jsonwebtoken");
const app = express();

const server = http.createServer(app);

const dirname = path.resolve();
const clientPath = path.join(dirname, 'dist/client');
console.log(clientPath)

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8081",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());
app.use(express.static(clientPath))

const databaseService = new DatabaseService("database.db");
const manager = new SessionManager(io, databaseService);
app.use("/api", routes(manager, databaseService));

io.on("connection", (socket) => {
  //TODO: need to do reconnection logic
  socket.on("leave", async (data, callback) => {
    const { sessionId, userId } = data;
    if (!sessionId || !userId) {
      return;
    }
    try {
      const user = await databaseService.getUserById(userId);
      const result = manager.removeUser(sessionId, user, socket);
      io.to(sessionId).emit("player-left", result);
      if (callback) {
        callback({ result });
      }
    } catch (err) {
      console.error(err);
    }
  });
  socket.on("remove", async (data, callback) => {
    const { sessionId, userId, hostId } = data;
    if (!sessionId || !userId || !hostId) {
      return;
    }
  });
  socket.on("join", async (data, callback) => {
    const { sessionId, token } = data;
    if (!sessionId || !token) {
      return;
    }
    try {
      console.log(sessionId);
      const decoded = jwt.decode(token);
      const user = await databaseService.getUserById(decoded.id);
      if (!user) {
        return;
      }
      const result = manager.joinSession(sessionId, user, socket);
      console.log(result);
      io.to(sessionId).emit("player-joined", result);
      if (callback) {
        callback({ result });
      }
    } catch (err) {
      console.error(err);
    }
  });
  socket.on("start", async (data, callback) => {
    const { sessionId, token } = data;

    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.id) {
        return socket.emit("start-session-error", { error: "Invalid token" });
      }

      const user = await databaseService.getUserById(decoded.id);
      if (!user) {
        return socket.emit("start-session-error", { error: "User not found" });
      }

      if (manager.getHostId(sessionId) !== user.id) {
        return socket.emit("start-session-error", {
          error: "You are not the host",
        });
      }
      const result = manager.startSession(sessionId, user.id);
      if (result) {
        io.to(sessionId).emit("session-started");
      }
      if (callback) {
        callback({ result });
      }
    } catch (err) {
      console.error("Error starting session:", err);
    }
  });

  socket.on("drive", async (data) => {
    const { sessionId, userToken } = data;
    const handler = manager.getHandler(sessionId);
    if (!handler) {
      return;
    }
    try {
      const decoded = jwt.decode(userToken);
      const user = await databaseService.getUserById(decoded.id);
      handler.session.handleDrive(user.id);
      const playerId = user.id;
      io.to(sessionId).emit('player-drive',playerId);
    } catch (err) {
      console.log(err);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
