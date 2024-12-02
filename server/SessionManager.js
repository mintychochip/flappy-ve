const { v4: uuidv4 } = require("uuid");
const {
  Player,
  Vector,
  GameObjectBuilder,
} = require("./src/Models");
const { Socket } = require("socket.io");

const config = {
  screenWidth: 1024,
  screenHeight: 768,
  pipe: {
    maxY: 600,
    minY: 700,
    width: 52,
    height: 320,
  },
  player: {
    width: 58,
    height: 22,
  },
  count: 5,
  gravity: 0,
};

function calculatePipeGap() {
  return (
    (config.screenWidth - config.count * config.pipe.width) / (config.count - 1)
  );
}

function createPipe(origin) {
  return new GameObjectBuilder('pipe')
  .setPosition(origin)
  .setVelocity(new Vector(-20,0))
  .build();
}

function createPlayer(origin, name) {
  return new GameObjectBuilder('player')
  .setBounded(true)
  .setGravity(60)
  .setName(name)
  .setPosition(origin)
  .build();
}
function random(max, min) {
  return Math.random() * (max - min) + min;
}

const createPipes = () => {
  const width = config.screenWidth;
  const pipeGap = calculatePipeGap();
  const pipes = new Map();
  for (let i = 0; i < config.count; i++) {
    const pipeX = width + pipeGap + i * (config.pipe.width + pipeGap);
    const pipeY = random(config.pipe.maxY, config.pipe.minY);

    const id = uuidv4();
    const origin = new Vector(pipeX, pipeY);
    const pipe = createPipe(origin);

    pipes.set(id, pipe);
  }
  return pipes;
};

class Session {
  constructor(sessionId, tps = 20, objects) {
    this.sessionId = sessionId;
    this.tps = tps;
    this.objects = objects;
  }

  join(socket, playerId, playerName) {
    socket.join(this.sessionId);
    const player = createPlayer(
      new Vector(100,config.screenHeight / 2),playerName);
      this.objects.set(playerId,player);
  }

  interval() {
    return 1000 / this.tps;
  }

  handle(io) {
    return setInterval(() => {
      this.objects.forEach((object, objectId) => {
        const data = {
          objectId,
          object,
          lerp: true,
        }
        if (object.type === "pipe") {
          object.update(1 / this.tps);
          if (object.position.x < -config.pipe.width) {
            const pipeX =
              config.screenWidth + calculatePipeGap() - config.pipe.width;
            const pipeY = random(config.pipe.maxY, config.pipe.minY);
            object.setPosition(pipeX, pipeY);
            data.lerp = false;
          }
        }
        if (object.type === "player") { 
          object.update(1 / this.tps);
        }
        
        io.to(this.sessionId).emit("update", data);
      });
    }, this.interval());
  }

  handleDrive(playerId) {
    const player = this.objects.get(playerId);
    player.velocity = new Vector(0, -30); 
    this.objects.set(playerId,player);
  }
}

class SessionManager {
  constructor(io) {
    this.io = io;
    this.sessionHandlers = new Map();
    this.sessions = new Map();
  }
  /**
   *
   * @param {Session} session
   * @param {*} tps
   */
  start(sessionId, tps = 20) {
    if (tps > 1000) {
      throw new Error("the tps is too high!");
    }
    const pipeObjects = createPipes();
    const session = new Session(sessionId,tps,pipeObjects);
   // this.io.to(sessionId).emit("starting", { sessionId, pipeObjects });
    const handlerId = session.handle(this.io);
    this.sessions.set(sessionId,session);
    this.sessionHandlers.set(sessionId,handlerId);
  }

  /**
   * 
   * @param {string} sessionId 
   * @returns {Session}
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }
  getSessionHandler(sessionId) {
    return this.sessionHandlers.get(sessionId);
  }
}

module.exports = { SessionManager };
