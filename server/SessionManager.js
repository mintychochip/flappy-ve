const { v4: uuidv4 } = require("uuid");
const {
  Player,
  Vector,
  GameObjectBuilder,
  GameObject,
  LeaderObject,
} = require("./src/Models");

class PipeFactory {
  constructor(initialVelocity, pipeDimensions) {
    this.initialVelocity =initialVelocity;
    this.pipeDimensions = pipeDimensions;
  }

  createPipe(origin) {
    return new GameObjectBuilder('pipe')
    .setPosition(origin)
    .setVelocity(this.initialVelocity)
    .setDimensions(this.pipeDimensions);
  }

  /**
   * 
   * @param {SessionConfig} sessionConfig 
   */
  createPipes(sessionConfig) {
    const {viewportWidth} = sessionConfig;
    const {x,y} = this.pipeDimensions;
    const pipeGap = sessionConfig.pipeGap(x);
    
    const pipes = new Map();
    for(let i = 0; i < sessionConfig.pipeCount; i++) {
      const pipeX = viewportWidth + pipeGap + i (x + pipeGap);
      const pipeY = sessionConfig.randomPipeY(y);
      
      const origin = new Vector(pipeX,pipeY);
      const delegate = this.createPipe(origin);

      const pipe = new LeaderObject(delegate).addFollower(uuidv4(),this.createPipe(origin)
        .setRotation(180)
        .build(), new Vector(0,-sessionConfig.pipeSpacer - y));

      pipes.set(uuidv4(),pipe);
    }
    return pipes;
  }
}

class PlayerFactory {
  constructor(gravity, playerDimensions) {
    this.gravity = gravity;
    this.playerDimensions = playerDimensions;
  }

  createPlayer(origin,name) {
    return new GameObjectBuilder("player")
    .setBounded(true)
    .setGravity(this.gravity)
    .setName(name)
    .setDimensions(this.playerDimensions)
    .setPosition(origin)
  }
}

class SessionConfig {
  constructor(viewportHeight, viewportWidth, pipeSpacer, pipeCount) {
    this.viewportHeight = viewportHeight;
    this.viewportWidth = viewportWidth;
    this.pipeSpacer = pipeSpacer;
    this.pipeCount = pipeCount;
  }

  pipeGap(pipeWidth) {
    return (this.viewportWidth - this.pipeCount * pipeWidth) / (this.pipeCount - 1);
  }
  pipeMaxY(pipeHeight) {
    return this.viewportHeight + pipeHeight / 6;
  }
  pipeMinY(pipeHeight) {
    return this.viewportHeight - pipeHeight / 2;
  }  
  randomPipeY(pipeHeight) {
    const max = this.pipeMaxY(pipeHeight);
    const min = this.pipeMinY(pipeHeight);
    return Math.random() * (max - min) + min;
  }
}
// function minValidPipeHeight(spacer, viewportHeight) {
//   return (3 * (viewportHeight - spacer)) / 4;
// }

class Session {
  /**
   * @param {string} sessionId
   * @param {number} tps
   * @param {GameObject} objects
   */
  constructor(sessionId, tps = 32, objects) {
    this.sessionId = sessionId;
    this.tps = tps;
    this.objects = objects;
  }

  join(socket, playerName) {
    socket.join(this.sessionId);
    const player = createPlayer(
      new Vector(100, config.screenHeight / 2),
      playerName
    ).build();
    const playerId = uuidv4();
    this.objects.set(playerId, player);
    return playerId;
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
        };
        if (object.type.includes("pipe") && object instanceof LeaderObject) {
          object.update(1 / this.tps);

          if (object.position.x < -2 * config.pipe.width) {
              let lowerPipeX = config.screenWidth + calculatePipeGap() - 2 * config.pipe.width;
              let lowerPipeY = random(config.pipe.maxY, config.pipe.minY);
              object.setPosition(lowerPipeX, lowerPipeY);
              data.lerp = false;
          }
          const objects = object.flatten(objectId);
          objects.forEach((object, id) => {
            io.to(this.sessionId).emit('update',{objectId: id, object, lerp: data.lerp});
          });
        }
        if (object.type === "player") {
          object.update(1 / this.tps, config.screenWidth, config.screenHeight);
          this.getPipes().forEach((pipe) => {
            if(pipe.collides(object)) {
              console.log('collision');
            }
          })
          io.to(this.sessionId).emit("update", data);
        }
      });
    }, this.interval());
  }

  getPipes() {
    return Array.from(this.objects.values()).filter(
      (object) => object.type === "pipe"
    );
  }

  handleDrive(io,playerId) {
    if(!io || !playerId) {
      return;
    }
    io.to(this.sessionId).emit('player-drive',playerId);
    const player = this.objects.get(playerId);
    player.velocity = new Vector(0, -8);
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
