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
  socket.on("create-room", ( data, callback ) => {
    const { playerName } = data;
 
    // Open new session/room
    const roomId = generateRoomId()
    // to refactor soon
    manager.start(roomId, 20); //this seems to start the game loop Im hoping to instantiate a session without starting game loop

    // Add requesting socket to session
    const session = manager.getSesssion(roomId);
    if(!session) return;
    const playerId = session.join(socket,playerName);
    session.join(socket,playerId, playerName);
       console.log(`Socket ${socket.id} named ${playerName} created: session ${roomId}`)
    if(callback) {
        callback({ roomId, playerId });
    }
  });
  socket.on("join-room", (data,callback) => {
    const { sessionId, playerName } = data;
    const session = manager.getSession(sessionId);
    if(!session) {
      console.log(`session: ${sessionId} not found`)
      return;
    }
    const playerId = session.join(socket,playerName);
    const playerNames = session.getPlayerNames();
    console.log(`Socket ${socket.id} id ${playerId} named ${playerName} joined: session ${sessionId}`);
    io.to(sessionId).emit('player-joined');
    if(callback) {
      callback({ sessionId, playerId, playerNames });
    }
  });
  socket.on('leave-room', (data) => {
    const { sessionId, playerId } = data;
    const session = manager.getSession(sessionId);
    if (!session) return;
    session.leave(playerId);
    io.to(sessionId).emit('player-left');
  });  
  socket.on('get-players', (data, callback) => {
    const { sessionId } = data;
    const session = manager.getSession(sessionId);
    if (!session) return;
    const players = session.getPlayerNames(); // Assuming you have a method to get players
    const isCreator = session.creatorId === socket.id;
    callback({ players, isCreator });
  });
  socket.on('start-session', (data) => {
    const { sessionId } = data;
    const session = manager.getSession(sessionId);
    manager.start(sessionId,20);
  });
  socket.on('start-session', (data) => {
    const { sessionId } = data;
    const session = manager.getSession(sessionId);
    if (session && session.creatorId === socket.id) {
      manager.startSession(sessionId);
    } else {
      socket.emit('error', 'Only the session creator can start the game.');
    }
  });
  socket.on('drive',(data) => {
    const { sessionId, playerId } = data;
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


