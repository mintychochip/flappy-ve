`⢀⡴⠑⡄⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣤⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠸⡇⠀⠿⡀⠀⠀⠀⣀⡴⢿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠑⢄⣠⠾⠁⣀⣄⡈⠙⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⡀⠁⠀⠀⠈⠙⠛⠂⠈⣿⣿⣿⣿⣿⠿⡿⢿⣆⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢀⡾⣁⣀⠀⠴⠂⠙⣗⡀⠀⢻⣿⣿⠭⢤⣴⣦⣤⣹⠀⠀⠀⢀⢴⣶⣆
⠀⠀⢀⣾⣿⣿⣿⣷⣮⣽⣾⣿⣥⣴⣿⣿⡿⢂⠔⢚⡿⢿⣿⣦⣴⣾⠁⠸⣼⡿
⠀⢀⡞⠁⠙⠻⠿⠟⠉⠀⠛⢹⣿⣿⣿⣿⣿⣌⢤⣼⣿⣾⣿⡟⠉⠀⠀⠀⠀⠀
⠀⣾⣷⣶⠇⠀⠀⣤⣄⣀⡀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀
⠀⠉⠈⠉⠀⠀⢦⡈⢻⣿⣿⣿⣶⣶⣶⣶⣤⣽⡹⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀
         ⠉⠲⣽⡻⢿⣿⣿⣿⣿⣿⣿⣷⣜⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀
          ⢸⣿⣿⣷⣶⣮⣭⣽⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣀⣀⣈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠻⠿⠿⠿⠿⠛⠉`;
//i'm sorry
const { v4: uuidv4 } = require("uuid");
const EventEmitter = require("events");
const {
  Player,
  Vector,
  GameObjectBuilder,
  GameObject,
  LeaderObject,
} = require("./src/Models");
const DatabaseService = require("./src/service/DatabaseService");

function generateSessionId() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let roomId = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    roomId += characters[randomIndex];
  }
  return roomId;
}
/**
 *
 * @param {SessionSettings} settings
 * @param {SessionConfig} config
 * @returns {number} pipeGap
 */
function calculatePipeGap(settings, config) {
  return (
    (settings.viewportWidth - config.pipeCount * settings.pipeDimensions.x) /
    (config.pipeCount - 1)
  );
}
/**
 *
 * @param {Vector} origin
 * @param {SessionSettings} settings
 * @param {SessionConfig} config
 * @returns {GameObjectBuilder}
 */
function createPipeBuilder(origin, settings, config) {
  return new GameObjectBuilder("pipe")
    .setPosition(origin)
    .setVelocity(config.pipeVelocity)
    .setDimensions(settings.pipeDimensions);
}
/**
 *
 * @param {SessionSettings} settings;
 * @param {SessionConfig} config
 * @returns
 */
function createPipes(settings, config) {
  const { viewportWidth, pipeSpacer } = settings;
  const { x, y } = settings.pipeDimensions;
  const pipeGap = calculatePipeGap(settings, config);

  const pipes = new Map();
  for (let i = 0; i < config.pipeCount; i++) {
    const pipeX = viewportWidth + pipeGap + i * (x + pipeGap);
    const pipeY = settings.randomPipeY();
    const origin = new Vector(pipeX, pipeY);
    const delegate = createPipeBuilder(origin, settings, config).build();
    const leader = new LeaderObject(delegate).addFollower(
      uuidv4(),
      createPipeBuilder(origin.clone(), settings, config)
        .setRotation(180)
        .build(),
      new Vector(0, -pipeSpacer - y)
    );
    pipes.set(uuidv4(), leader);
  }
  return pipes;
}
/**
 *
 * @param {string} playerName
 * @param {SessionSettings} settings
 * @param {SessionConfig} config
 * @returns
 */
function createPlayer(playerName, settings, config) {
  return Player.createFromGameObject(
    new GameObjectBuilder("player")
      .setBounded(true)
      .setGravity(config.playerGravity)
      .setName(playerName)
      .setDimensions(settings.playerDimensions.clone())
      .setPosition(settings.playerOrigin.clone())
      .build()
  );
}
class SessionSettings {
  /**
   *
   * @param {number} viewportHeight
   * @param {number} viewportWidth
   * @param {number} pipeSpacer
   * @param {Vector} pipeDimensions
   * @param {Vector} playerDimensions
   * @param {Vector} playerOrigin
   */
  constructor(
    viewportHeight,
    viewportWidth,
    pipeSpacer,
    pipeDimensions,
    playerDimensions,
    playerOrigin
  ) {
    this.viewportHeight = viewportHeight;
    this.viewportWidth = viewportWidth;
    this.pipeSpacer = pipeSpacer;
    this.pipeDimensions = pipeDimensions;
    this.playerDimensions = playerDimensions;
    this.playerOrigin = playerOrigin;
  }

  randomPipeY() {
    const max = this.viewportHeight + this.pipeDimensions.y / 6;
    const min = this.viewportHeight - this.pipeDimensions.y / 2;
    const num = Math.random() * (max - min) + min;
    return num;
  }
}
class SessionConfig {
  /**
   *
   * @param {number} pipeCount
   * @param {Vector} pipeVelocity
   * @param {number} playerGravity
   * @param {number} tps
   * @param {Vector} playerJumpVelocity
   */
  constructor(pipeCount, pipeVelocity, playerGravity, tps, playerJumpVelocity) {
    this.pipeCount = pipeCount;
    this.pipeVelocity = pipeVelocity;
    this.playerGravity = playerGravity;
    this.tps = tps;
    this.playerJumpVelocity = playerJumpVelocity;
  }

  interval() {
    return 1000 / this.tps;
  }
}
class Session {
  /**
   * @param {SessionConfig} config
   * @param {SessionSettings} settings
   */
  constructor(config, settings) {
    this.config = config;
    this.settings = settings;
    this.objects = createPipes(settings, config);
    this.scores = new Map();
    this.started = new Date().toISOString();
  }

  playersAlive() {
    return this.getPlayers().filter(([id, player]) => {
      return player.alive;
    });
  }

  handleDrive(playerId) {
    if (!playerId) {
      return;
    }
    const player = this.objects.get(playerId);
    const { playerJumpVelocity } = this.config;
    player.velocity = playerJumpVelocity.clone();
  }

  getPlayers() {
    return Array.from(this.objects.entries()).filter(
      ([id, obj]) => obj.type === "player"
    );
  }

  getPipes() {
    return Array.from(this.objects.entries()).filter(
      ([id, obj]) => obj.type === "pipe"
    );
  }

  playerIsAlive(playerId) {
    if(!this.objects.has(playerId)) {
      return false;
    }
    const player = this.objects.get(playerId);
    if(player instanceof Player) {
      return player.alive;
    }
  }
  incrementScore(playerId) {
    if (!this.scores.has(playerId)) {
      return;
    }
    if(!this.playerIsAlive(playerId)) {
      return
    }
    const score = this.scores.get(playerId);
    this.scores.set(playerId, score + 1);
  }
  /**
   *
   * @param {User} user
   * @returns
   */
  joinPlayer(user) {
    if (!this.objects.has(user.id)) {
      const player = createPlayer(user.name, this.settings, this.config);
      this.objects.set(user.id, player);
      this.scores.set(user.id, 0);
    }
  }

  removePlayer(user) {
    if (!this.objects.has(user.id)) {
      return;
    }
    this.objects.delete(user.id);
  }
  toJSON() {
    const objects = {};

    this.objects.forEach((object, id) => {
      objects[id] = object;
    });
    return {
      settings: this.settings,
      config: this.config,
      hostId: this.hostId,
      objects,
    };
  }
}
class SessionDispatch {
  /**
   *
   * @param {Socket} io
   * @param {string} sessionId
   * @param {SessionManager} observer
   */
  constructor(io, sessionId, observer) {
    this.io = io;
    this.sessionId = sessionId;
    this.observer = observer;
    this.stopped = false;
  }
  update(objectId, object, lerp) {
    if (object instanceof LeaderObject) {
      const objects = object.flatten(objectId);
      objects.forEach((object, id) => {
        this.update(id, object, lerp);
      });
    }
    const data = {
      objectId,
      object,
      lerp,
    };
    this.io.to(this.sessionId).emit("update", data);
  }

  /**
   *
   * @param {SessionHandler} handler
   */
  stop(handler) {
    if(this.stopped) {
      return;
    }
    this.stopped = true;
    handler.stop();
    const { scores,started } = handler.session;
    this.observer.notify("stopped", {
      sessionId: this.sessionId,
      scores,
      started,
    }, (matchId) => {
      this.io.to(this.sessionId).emit("session-stopped", matchId);
    });    
  }
}
class SessionHandler {
  /**
   *
   * @param {Session} session
   * @param {SessionManager} observer
   */
  constructor(session, observer) {
    this.session = session;
    this.observer = observer;
    this.handlerId = null;
  }

  start(dispatch) {
    if (this.handlerId || !this.session) {
      return false;
    }
    const { settings, config } = this.session;
    const interval = config.interval();
    const pipeGap = calculatePipeGap(settings, config);
    this.handlerId = setInterval(() => {
      this.session.objects.forEach((object, objectId) => {
        let lerp = true;
        const { position } = object;
        if (this.session.playersAlive() == 0) {
          dispatch.stop(this);
        }
        if (object.type.includes("pipe")) {
          const previousX = position.x;
          object.update(1 / config.tps);
          const nextX = position.x;
          if (
            previousX > settings.playerOrigin.x &&
            settings.playerOrigin.x >= nextX
          ) {
            this.session.getPlayers().forEach(([id,player])=> {
              this.session.incrementScore(id);
            });
          }
          if (position.x < -2 * settings.pipeDimensions.x) {
            const pipeX =
              settings.viewportWidth + pipeGap - 2 * settings.pipeDimensions.x;
            const pipeY = settings.randomPipeY();
            object.setPosition(pipeX, pipeY);
            lerp = false;
          }
          dispatch.update(objectId, object, lerp);
        }
        if (object.type === "player" && object instanceof Player) {
          object.update(
            1 / config.tps,
            settings.viewportWidth,
            settings.viewportHeight
          );
          this.session.getPipes().forEach(([id, pipe]) => {
            if (pipe.collides(object)) {
              object.alive = false;
            }
          });
          dispatch.update(objectId, object, lerp);
        }
      });
    }, interval);
    return true;
  }

  hasStarted() {
    return this.handlerId != null;
  }

  stop() {
    if (!this.handlerId) {
      return;
    }
    clearInterval(this.handlerId);
  }
}

class SessionManager {
  /**
   *
   * @param {Socket} io
   * @param {DatabaseService} service
   */
  constructor(io, service) {
    this.io = io;
    this.handlers = new Map();
    this.hosts = new Map();
    this.service = service;
  }

  /**
   *
   * @param {string} playerId
   * @param {SessionConfig} config
   * @param {SessionSettings} settings
   * @returns {string} sessionId
   */
  createSession(settings, config, playerId) {
    if (this.hosts.has(playerId)) {
      const sessionId = this.hosts.get(playerId);
      throw new Error(`Player is already hosting session ${sessionId}`);
    }
    const session = new Session(config, settings);
    const handler = new SessionHandler(session, this);
    const sessionId = generateSessionId();
    this.hosts.set(playerId, sessionId);
    this.handlers.set(sessionId, handler);
    return { sessionId, session };
  }

  /**
   *
   * @param {string} sessionId
   * @param {User} user
   * @param {Socket} socket
   * @returns {boolean}
   */
  joinSession(sessionId, user, socket) {
    if (!sessionId || !user) {
      return false;
    }
    const handler = this.handlers.get(sessionId);
    if (!handler || handler.hasStarted()) {
      return false;
    }
    socket.join(sessionId);
    handler.session.joinPlayer(user);
    return true;
  }

  removeUser(sessionId, user, socket) {
    if (!sessionId || !user) {
      return false;
    }
    const handler = this.handlers.get(sessionId);
    if (!handler) {
      return false;
    }
    socket.leave(sessionId);
    handler.session.removePlayer(user);
    const hostId = this.getHostId(sessionId);
    if(hostId === user.id) {
      this.hosts.delete(hostId);
      this.handlers.delete(sessionId);
    }
    return true;
  }

  startSession(sessionId, playerId) {
    if (!(this.handlers.has(sessionId) && this.hosts.has(playerId))) {
      return false;
    }
    const handler = this.handlers.get(sessionId);
    return handler.start(new SessionDispatch(this.io, sessionId, this));
  }

  getHandler(sessionId) {
    const handler = this.handlers.get(sessionId);
    return handler;
  }

  getHostId(sessionId) {
    if (!sessionId) {
      return null;
    }
    for (let [host, session] of this.hosts) {
      if (session === sessionId) {
        return host;
      }
    }

    return null;
  }

  async notify(event, data, callback) {
    switch (event) {
      case "stopped":
        if (!data) {
          return;
        }
  
        const { sessionId, scores, started } = data;
        const hostId = this.getHostId(sessionId);
        this.hosts.delete(hostId);
        this.handlers.delete(sessionId);
  
        if (this.service) {
          const ended = new Date().toISOString();
          
          try {
            const { id } = await this.service.createMatch(started, ended);
  
            for (const [userId, score] of scores) {
              try {
                await this.service.createMatchResult(id, userId, score);
              } catch (err) {
                console.error(`Failed to create match result for user ${userId}:`, err);
              }
            }
            if(callback) {
              callback({ id });
            }
          } catch (err) {
            console.error("Error creating match:", err);
          }
        }
        break;
      }
  }
}

module.exports = { SessionManager, SessionConfig, SessionSettings };
