const { v4: uuidv4 } = require("uuid");
const {
  Player,
  Vector,
  GameObjectBuilder,
  GameObject,
  LeaderObject,
} = require("./src/Models");
const config = {
  screenWidth: 1024,
  screenHeight: 768,
  pipe: {
    width: 52,
    height: 456,
    // vh + h/6
    maxY: 844,
    minY: 540,
  },
  player: {
    width: 58,
    height: 22,
  },
  count: 4,
};

function minValidPipeHeight(spacer, viewportHeight) {
  return (3 * (viewportHeight - spacer)) / 4;
}

function createPipe(type, origin) {
  return new GameObjectBuilder(type)
    .setPosition(origin)
    .setVelocity(new Vector(-20, 0))
    .setWidth(52)
    .setHeight(456);
}

function createPlayer(origin, name) {
  return new GameObjectBuilder("player")
    .setBounded(true)
    .setGravity(70)
    .setName(name)
    .setWidth(58)
    .setHeight(22)
    .setPosition(origin)
    .build();
}

function random(max, min) {
  return Math.random() * (max - min) + min;
}

function calculatePipeGap() {
  return (
    (config.screenWidth - config.count * config.pipe.width) / (config.count - 1)
  );
}
const createPipes = () => {
  const width = config.screenWidth;
  const pipeGap = calculatePipeGap();
  const pipes = new Map();
  for (let i = 0; i < config.count; i++) {
    const pipeX = width + pipeGap + i * (config.pipe.width + pipeGap);
    const pipeY = random(config.pipe.maxY, config.pipe.minY);

    const origin = new Vector(pipeX, pipeY);
    const pipe = createPipe("pipe", origin);
    const object = new LeaderObject(pipe).addFollower(uuidv4(),createPipe('pipe',new Vector(origin.x,origin.y)).setRotation(180).build(),new Vector(0,-160 - config.pipe.height));
    pipes.set(uuidv4(), object);
  }
  return pipes;
};

class Session {
  /**
   * @param {string} sessionId
   * @param {number} tps
   * @param {GameObject} objects
   */
  constructor(sessionId, tps = 20, objects) {
    this.sessionId = sessionId;
    this.tps = tps;
    this.objects = objects;
    this.started = false;
    this.creatorId = null;
  }

  join(socket, playerName) {
    socket.join(this.sessionId);
    const player = createPlayer(
      new Vector(100, config.screenHeight / 2),
      playerName
    );
    const playerId = uuidv4();
    this.objects.set(playerId, player);
    if (!this.creatorId) {
      this.creatorId = socket.id; // Set the first player as the creator
    }
    return playerId;
  }

  start(io) {
    if (this.started) {
      return;
    }
    this.started = true;
    this.handlerId = this.handle(io);
  } 
  
  interval() {
    return 1000 / this.tps;
  }

  handle(io) {
    return setInterval(() => {
      const pipes = Array.from(this.objects.values()).filter(
        (object) => object.type === "pipe"
      );
      this.objects.forEach((object, objectId) => {
        const data = {
          objectId,
          object,
          lerp: true,
        };
        if (object.type.includes("pipe") && object instanceof LeaderObject) {
          object.update(1 / this.tps);

          const objects = object.flatten(objectId);
          if (object.position.x < -2 * config.pipe.width) {
              let lowerPipeX = config.screenWidth + calculatePipeGap() - 2 * config.pipe.width;
              let lowerPipeY = random(config.pipe.maxY, config.pipe.minY);
              object.setPosition(lowerPipeX, lowerPipeY);
              data.lerp = false;
          }
          objects.forEach((object, id) => {
            io.to(this.sessionId).emit('update',{objectId: id, object, lerp: data.lerp});
          });
        }
        if (object.type === "player") {
          object.update(1 / this.tps, config.screenWidth, config.screenHeight);
          io.to(this.sessionId).emit("update", data);
        }
      });
    }, this.interval());
  }

  getPipes() {
    return this.objects.filter((object) => object.type === "pipe");
  }
  getPlayerNames() {
    return [...this.objects.values()].filter(object => object.type === "player").map( player => player.name);
  }
  handleDrive(io,playerId) {
    if(!io || !playerId) {
      return;
    }
    io.to(this.sessionId).emit('player-drive',playerId);
    const player = this.objects.get(playerId);
    player.velocity = new Vector(0, -30);
    this.objects.set(playerId, player);
  }

  static 
}

class SessionManager {
  constructor(io) {
    this.io = io;
    this.sessionHandlers = new Map();
    this.sessions = new Map();
  }

  createSession(sessionId, tps = 20) {
    const session = new Session(sessionId, tps, new Map());
    this.sessions.set(sessionId, session);
  }
  startSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session && !session.started) {
      const pipeObjects = createPipes();
      pipeObjects.forEach((pipe, id) => session.objects.set(id, pipe));
      session.start(this.io);
      this.io.to(sessionId).emit('session-started');
    }
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
    const session = new Session(sessionId, tps, pipeObjects);
    // this.io.to(sessionId).emit("starting", { sessionId, pipeObjects });
    const handlerId = session.handle(this.io);
    this.sessions.set(sessionId, session);
    this.sessionHandlers.set(sessionId, handlerId);
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
