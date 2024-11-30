const express = require("express");
const router = express.Router();

module.exports = (lobbyService) => {
  router.get("/lobby", async (req, res) => {
    try {
      const result = await lobbyService.getAllLobbies();
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json(err); 
    }
  });

  router.post("/lobby", async (req, res) => {
    const { socket_id } = req.body;

    if (!socket_id) {
      return res.status(400).json({ error: "username is required" });
    }

    try {
      const result = await lobbyService.createLobby(socket_id);
      return res.status(201).json(result);
    } catch (err) {
      return res.status(500).json(err);
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
      return res.status(500).json(err);
    }
  });

  router.get("/user", async (req, res) => {
    try {
      const result = await lobbyService.getAllUsers();
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json(err);
    }
  });

  router.get("/host", async(req, res) => {
    try {
      const result = await lobbyService.getAllHosts();
      return res.status(200).json(result);
    } catch(err) {
      return res.status(500).json(err);
    }
  })
  return router;
};