const { v4: uuidv4 } = require("uuid");
const EventEmitter = require("events");
const {
  Player,
  Vector,
  GameObjectBuilder,
  GameObject,
  LeaderObject,
} = require("./src/Models");

function generateSessionId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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
    (settings.viewportWidth - config.pipeCount * settings.pipeDimensions.x) / (config.pipeCount - 1)
  );
}
/**
 *
 * @param {Vector} origin
 * @param {SessionConfig} config
 * @param {SessionSettings} settings
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
function createPipes(settings,config) {
  const { viewportWidth } = settings;
  const { x, y } = settings.pipeDimensions;
  const pipeGap = calculatePipeGap(settings,config);

  const pipes = new Map();
  for (let i = 0; i < config.pipeCount; i++) {
    const pipeX = viewportWidth + pipeGap + i * (x + pipeGap);
    const pipeY = settings.randomPipeY();

    const origin = new Vector(pipeX, pipeY);

    const delegate = createPipeBuilder(origin, settings, config).build();

    const pipe = new LeaderObject(delegate).addFollower(
      uuidv4(),
      createPipeBuilder(origin, settings, config).setRotation(180).build(),
      new Vector(0, 0)
    );
    pipes.set(uuidv4(), pipe);
  }
  return pipes;
}
/**
 * 
 * @param {string} playerName 
 * @param {SessionSettings} sessionSettings
 * @param {SessionConfig} sessionConfig 
 * @returns 
 */
function createPlayer(playerName, sessionSettings, sessionConfig) {
  return new GameObjectBuilder("player")
    .setBounded(true)
    .setGravity(sessionConfig.playerGravity)
    .setName(playerName)
    .setDimensions(sessionSettings.playerDimensions)
    .setPosition(sessionSettings.playerOrigin);
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
  constructor(viewportHeight,viewportWidth, pipeSpacer, pipeDimensions, playerDimensions, playerOrigin) {
    this.viewportHeight = viewportHeight;
    this.viewportWidth = viewportWidth;
    this.pipeSpacer = pipeSpacer;
    this.pipeDimensions = pipeDimensions;
    this.playerDimensions = playerDimensions;
    this.playerOrigin=  playerOrigin;
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
  constructor(
    pipeCount,
    pipeVelocity,
    playerGravity,
    tps,
    playerJumpVelocity
  ) {
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
    this.objects = createPipes(settings,config);
  }

  handleDrive(io, playerId) {
    if (!playerId) {
      return;
    }
    const player = this.objects.get(playerId);
    player.velocity = this.config.playerJumpVelocity;
  }

  getPlayers() {
    return Array.from(this.objects.entries())
    .filter(([id, obj]) => obj.type === 'player')
    .map(([id, obj]) => ({
      playerId: id,
      playerName: obj.name,
    }));
  }

  /**
   * 
   * @param {User} user 
   * @returns 
   */
  joinPlayer(user) {
    if(this.objects.has(user.id)) {
      return;
    }
    const player = createPlayer(user.name,this.settings, this.config).build();
      this.objects.set(user.id,player);
  }

  removePlayer(user) {
    if(!this.objects.has(user.id)) {
      return;
    }
    this.objects.delete(user.id);
  }
  toJSON() {
    const objects = {};

    this.objects.forEach((object,id) => {
      objects[id] = object;
    });
    return {
      settings: this.settings, config: this.config, hostId: this.hostId, objects
    }
  }
}
class SessionDispatch {
  /**
   * 
   * @param {Socket} io 
   * @param {string} sessionId 
   */
  constructor(io, sessionId) {
    this.io = io;
    this.sessionId = sessionId;
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
    this.io.to(this.sessionId).emit('update',data);
  }

  start() {
    this.io.to(this.sessionId).emit('started');
  }
}
class SessionHandler {
  /**
   *
   * @param {Session} session
   */
  constructor(session) {
    this.session = session;
    this.handlerId = null;
  }

  start(dispatch) {
    if (this.handlerId || !this.session) {
      return this;
    }
    dispatch.start();
    const { settings, config } = this.session;
    const interval = config.interval();
    const pipeGap = calculatePipeGap(settings,config);
    this.handlerId = setInterval(() => {
      this.session.objects.forEach((object, objectId) => {
        let lerp = true;
        if (object.type.includes("pipe") && object instanceof LeaderObject) {
          object.update(1 / config.tps);
          if (object.position.x < -2 * settings.pipeDimensions.x) {
            const pipeX =
              settings.viewportWidth + pipeGap - 2 * settings.pipeDimensions.x; 
            const pipeY = settings.randomPipeY();
            object.setPosition(pipeX, pipeY);
            lerp = false;
          }
          dispatch.update(objectId, object, lerp);
        }
        // if (object.type === "player") {
        //   // object.update(
        //   //   1 / config.tps,
        //   //   settings.viewportWidth,
        //   //   settings.viewportHeight
        //   // );
        //   // this.getPipes().forEach((pipe) => {
        //   //   if (pipe.collides(object)) {
        //   //     console.log("collision");
        //   //   }
        //   // });
        //   // dispatch.update(objectId, object, lerp);
        // }
      });
    }, interval);
    return this;
  }

  hasStarted() {
    return this.handlerId != null;
  }

  stop() {
    clearInterval();
  }
}

class SessionManager {
  /**
   *
   * @param {Socket} io
   */
  constructor(io) {
    this.io = io;
    this.handlers = new Map();
    this.hosts = new Map();
  }

  /**
   *
  * @param {string} playerId
   * @param {SessionConfig} config
   * @param {SessionSettings} settings
   * @returns {string} sessionId
   */
  createSession(settings, config, playerId) {
    if(this.hosts.has(playerId)) {
      const sessionId = this.hosts.get(playerId);
      throw new Error(`Player is already hosting session ${sessionId}`);
    }
    const session = new Session(config, settings);
    const handler = new SessionHandler(session);
    const sessionId = generateSessionId();
    this.hosts.set(playerId,sessionId);
    this.handlers.set(sessionId, handler);
    return {sessionId, session};
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

  leaveSession(sessionId, user) {
    if(!sessionId || !user) {
      return false;
    }
    const handler = this.handlers.get(sessionId);
    if(!handler) {
      return false;
    }
    socket.join(sessionId);
    handler.session.removePlayer(user);
    return true;
  }
  
  start(sessionId, playerId) {
    if(!(this.handlers.has(sessionId) && this.hosts.has(playerId))) {
      return;
    }
    const handler = this.handlers.get(sessionId);
    handler.start(new SessionDispatch(this.io, sessionId));
  }

  getHandler(sessionId) {
    const handler = this.handlers.get(sessionId);
    return handler;
  }

  getHostId(sessionId) {
    if(!sessionId) {
      return null;
    }
    for(let [host,session] of this.hosts) {
      if(session === sessionId) {
        return host;
      }
    }

    return null;
  }
}

module.exports = { SessionManager, SessionConfig, SessionSettings };
