const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SessionManager, SessionSettings, SessionConfig } = require("../../SessionManager");
const DatabaseService = require("../service/DatabaseService");
const { Vector } = require("../Models");
const router = express.Router();
const SECRET = "a secret";
const sessionSettings = new SessionSettings(
  768,
  1024,
  160,
  new Vector(52, 456),
  new Vector(58, 22),
  new Vector(100, 1024 / 2)
);
/**
 *
 * @param {SessionManager} sessionManager
 * @param {DatabaseService} databaseService
 */
module.exports = (sessionManager, databaseService) => {
  router.post("/session/start", authenticate, async(req,res) => {
    const { sessionId, userToken } = req.body;
    try {
      const { id: userId } = jwt.decode(userToken);
      console.log(userId);
      if(!userId) {
        return res.status(400).json({ error: "Token was not provided. "});
      }
      sessionManager.start(sessionId, userId);
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  })
  router.post("/session", authenticate, async (req, res) => {
    const { config, token } = req.body;
    try {
      const {id } = jwt.decode(token);
      if (!id) {
        return res.status(400).json({ error: "Token was not provided." });
      }
       
      const sessionConfig = new SessionConfig(config.pipeCount,config.pipeVelocity, config.playerGravity, config.tps,config.playerJumpVelocity);
      const {session, sessionId} = sessionManager.createSession(
        sessionSettings,
        sessionConfig,
        id
      );
      res.status(201).json({ session,sessionId });
    } catch (err) {
      console.log(err)
      res.status(500).json({ err });
    }
  });
  router.get("/session", async(req,res) => {
    try {
      const sessions = {};
      sessionManager.handlers.forEach((handler,id) => {
        sessions[id] = handler.session;
      });

      return res.status(200).json({ sessions });
    } catch (err) {
      res.status(500).json({ err });
    }
  });
  router.get("/session/:id", async (req, res) => {
    const sessionId = req.params.id;
    try {
      const {session} = sessionManager.getHandler(sessionId);
      if(!session) {
        return res.status(403).json({ error: "The session does not exist."});
      }
      const hostId = sessionManager.getHostId(sessionId);
      const host = await databaseService.getUserById(hostId);
      res.status(200).json({ session, host });
    } catch (err) {
      res.status(500).json({ err });
    }
  });
  router.get("/user", async (req, res) => {
    try {
      const users = await databaseService.getAllUsers();

      return res.status(200).json({ users });
    } catch (err) {
      res.status(500).json({ err });
    }
  });
  router.post("/user", async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: "name and password are required." });
    }
    try {
      const hashed = await bcrypt.hash(password, 10);

      const user = await databaseService.createUser(name, hashed);

      return res.status(201).json({ user });
    } catch (err) {
      return res.status(500).json({ err });
    }
  });
  router.post("/user/decode", authenticate, async(req,res) => {
    const token = req.headers['authorization']?.split(" ")[1];
    if(!token) {
      return res.status(400).json({ error: "token is required"});
    }
    try {
      const decoded = jwt.decode(token);
      res.status(200).json({ user: decoded });
    } catch (err) {
      res.status(401).json({ err });
    }
  });
  router.post("/user/verify", authenticate, async(req,res) => {
    const token = req.headers['authorization']?.split(" ")[1];
    if(!token) {
      return res.status(400).json({ error: "token is required"});
    }
    try {
      const decoded = jwt.verify(token, SECRET);
      res.status(200).json({ user: decoded });
    } catch (err) {
      res.status(401).json({ err });
    }
  });
  router.post("/user/login", async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    try {
      const user = await databaseService.getUserByName(name);
      if (!user) {
        return res
          .status(404)
          .json({
            error: "The user was not found or the password was incorrect.",
          });
      }

      const matches = await bcrypt.compare(password, user.password);
      if (matches) {
        const payload = {
          id: user.id,
          name: user.name,
        };
        const token = jwt.sign(payload, SECRET, { expiresIn: "1h" });

        return res.status(200).json({ token });
      } else {
        return res
          .status(401)
          .json({
            error: "The user was not found or the password was incorrect.",
          });
      }
    } catch (err) {
      return res.status(500).json({ err });
    }
  });
  return router;
};

function authenticate(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "access denied" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
}
