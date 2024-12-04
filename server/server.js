// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const LobbyService = require("./src/service/LobbyService");
const routes = require("./src/routes/ApiController"); // Import the routes directly
const { NameGenerator } = require("./src/service/NameGenerator");
const { join } = require("path");
const { SessionManager} = require("./SessionManager");

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

// Initialize LobbyService with socket.io instance
const lobbyService = new LobbyService(io);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Use routes, passing lobbyService as a dependency
app.use("/api", routes(lobbyService));
const manager = new SessionManager(io);
const id = generateRoomId();
console.log(id);
manager.start(id,20);
io.on("connection", (socket) => {
  socket.on("create-room", (args) => {
    const {  } = args;
    
    // Open new room
    const roomId = generateRoomId()
    manager.start(roomId, 20);

    // Add requesting socket to session
    const session = manager.getSession(roomId);
    if(!session) {
      return;
    }
    session.join(socket,playerId, playerName);
    console.log(`Socket ${socket.id} named ${playerName} joined: session ${sessionId}`)
    if(callback) {
        callback({ success: true });
    }
  });
  socket.on("join-room", (response,callback) => {
    const { sessionId, playerId, playerName } = response;
    const session = manager.getSession(sessionId);
    if(!session) {
      return;
    }
    session.join(socket, playerId, playerName);
    console.log(`Socket ${socket.id} id ${playerId} named ${playerName} joined: session ${sessionId}`)
    if(callback) {
        callback({ sessionId, playerId, playerName });
    }
  });
  socket.on('drive',(response) => {
    const { sessionId, playerId } = response;
    const session = manager.getSession(sessionId);
    if(!session) {
      return;
    }
    session.handleDrive(io,playerId);
  });
});

function generateRoomId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let roomId = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    roomId += characters[randomIndex];
  }
  return roomId;
}
// Set the port and start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


