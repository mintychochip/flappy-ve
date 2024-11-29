// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const LobbyService = require('./src/service/LobbyService');
const routes = require('./src/routes/ApiController'); // Import the routes directly

// Create an Express app
const app = express();

// Create an HTTP server and pass the Express app
const server = http.createServer(app);

// Initialize socket.io with the HTTP server
const io = socketIo(server);

// Initialize LobbyService with socket.io instance
const lobbyService = new LobbyService(io);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Use routes, passing lobbyService as a dependency
app.use('/api', routes(lobbyService));

// Set up socket.io event handlers
io.on('connection', (socket) => {
    console.log('A user connected');    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Set the port and start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});