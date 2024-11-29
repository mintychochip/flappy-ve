const express = require("express");
const router = express.Router();

module.exports = (lobbyService) => {
  router.get("/lobby", async (req, res) => {
    try {
      const result = await lobbyService.getAllLobbies();
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch lobbies" });
    }
  });

  router.post("/lobby", async (req, res) => {
    const { lobby_name, user_name } = req.body;

    if (!lobby_name || !user_name) {
      return res
        .status(400)
        .json({ error: "Lobby name and user name are required" });
    }

    try {
      const result = await lobbyService.createLobby(lobby_name, user_name);
      return res.status(201).json(result);
    } catch (err) {
      return res.status(500).json({ error: "Failed to create lobby" });
    }
  });

  router.post("/user", async (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    try {
      const result = await lobbyService.createUser(name);

      return res.status(201).json(result);
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Failed to create user", details: err.message });
    }
  });

  router.get("/user", async (req, res) => {
    try {
      const result = await lobbyService.getAllUsers();
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch users", details: err.message });
    }
  });
  
  return router;
};
