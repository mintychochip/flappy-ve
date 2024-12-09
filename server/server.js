// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const routes = require("./src/routes/ApiController"); // Import the routes directly
const { join } = require("path");
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
// Create an Express app
const app = express();

// Create an HTTP server and pass the Express app
const server = http.createServer(app);

// Initialize socket.io with the HTTP server
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8081", // Allow only this origin
    methods: ["GET", "POST"],
  },
});

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
const manager = new SessionManager(io);
const config = new SessionConfig(
  4,
  new Vector(-10, 0),
  50,
  32,
  new Vector(0, -8)
);
const settings = new SessionSettings(
  768,
  1024,
  160,
  new Vector(52, 456),
  new Vector(58, 22),
  new Vector(100, 1024 / 2)
);
const databaseService = new DatabaseService("database.db");
app.use("/api", routes(manager, databaseService));

io.on("connection", (socket) => {
  socket.on("join-session", async (data, callback) => {
    const { sessionId, token } = data;
    if(!sessionId || !token) {
      return;
    }
    try {
      const decoded = jwt.decode(token);
      const user = await databaseService.getUserById(decoded.id);
      if(!user) {
        return;
      }
      const success = manager.joinSession(sessionId, user, socket);
      if(success) {
        io.to(sessionId).emit("player-joined");
        if(callback) {
          callback({ success });
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("drive", (data) => {
    const { sessionId, playerId } = data;
    const session = manager.getSession(sessionId);
    if (!session) {
      return;
    }
    session.handleDrive(io, playerId);
  });
});

// Set the port and start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
