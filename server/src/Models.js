class Lobby {
  /**
   *
   * @param {number} id
   * @param {string} name
   * @param {number} max_count
   */
  constructor(id, name, max_count) {
    this.id = id;
    this.name = name;
    this.max_count = max_count;
  }
}

class User {
  /**
   *
   * @param {string} socket_id
   * @param {string} name
   * @param {number} lobby_id //nullable
   */
  constructor(socket_id, name, lobby_id) {
    this.socket_id = socket_id;
    this.name = name;
    this.lobby_id = lobby_id;
  }
}

class Host {
  /**
   *
   * @param {string} host_id
   * @param {number} lobby_id
   */
  constructor(host_id, lobby_id) {
    this.host_id = host_id;
    this.lobby_id = lobby_id;
  }
}

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
class GameObject {

  constructor(type, position, velocity, name, gravity, properties) {
    this.type = type;
    this.position = position;
    this.velocity = velocity;
    this.name = name;
    this.gravity = gravity;
    this.properties = properties;
  }

  update(deltaTime) {
    if(this.gravity) {
      this.velocity.y += this.gravity * deltaTime;
    }
    let displacementY = this.position.y + this.velocity.y;
    let displacementX = this.position.x + this.velocity.x;
    if(this.properties.bounded) {
     displacementY = Math.max(0,displacementY);
     displacementX = Math.max(0,displacementX); 
    }
    this.position.y = displacementY;
    this.position.x = displacementX;
  }

  setPosition(x,y) {
    this.position.x = x;
    this.position.y = y;
  }
}

class GameObjectBuilder {
  constructor(type = 'default') {
    this.type = type;
    this.position = new Vector(0, 0);
    this.velocity = new Vector(0, 0);
    this.hitbox = { width: 0, height: 0 };
    this.gravity = 0;
    this.name = '';
    this.properties = { bounded: false };
  }

  setPosition(vec) {
    this.position = vec;
    return this;
  }

  setName(name) {
    this.name = name;
    return this;
  }

  setVelocity(vec) {
    this.velocity = vec;
    return this;
  }

  setHitbox(width, height) {
    this.hitbox = { width, height };
    return this;
  }

  setGravity(gravity) {
    this.gravity = gravity;
    return this;
  }

  setBounded(bounded) {
    this.properties.bounded = bounded;
    return this;
  }

  setProperty(key, value) {
    this.properties[key] = value;
    return this;
  }

  build() {
    return new GameObject(
      this.type,
      this.position,
      this.velocity,
      this.name,
      this.gravity,
      this.properties
    );
  }
}

class Hitbox {
  /**
   *
   * @param {Vector} pointOne
   * @param {Vector} pointTwo
   */
  constructor(pointOne, pointTwo) {
    this.pointOne = pointOne;
    this.pointTwo = pointTwo;
  }
  /**
   * Creates a hitbox centered around a given coordinate with x and y radii.
   * @param {Vector} center - The center of the hitbox.
   * @param {number} xRadius - The horizontal radius (half-width) of the hitbox.
   * @param {number} yRadius - The vertical radius (half-height) of the hitbox.
   * @returns {Hitbox} - The newly created hitbox.
   */
  static create(center, xRadius, yRadius) {
    const pointOne = new Vector(center.x - xRadius, center.y - yRadius);
    const pointTwo = new Vector(center.x + xRadius, center.y + yRadius);
    return new Hitbox(pointOne, pointTwo);
  }
  /**
   * Checks if two hitboxes collide.
   * @param {Hitbox} one - The first hitbox.
   * @param {Hitbox} two - The second hitbox.
   * @returns {boolean} - Returns true if the two hitboxes overlap, false otherwise.
   */
  static collides(one, two) {
    return (
      hitbox1.pointOne.x < hitbox2.pointTwo.x &&
      hitbox1.pointTwo.x > hitbox2.pointOne.x &&
      hitbox1.pointOne.y < hitbox2.pointTwo.y &&
      hitbox1.pointTwo.y > hitbox2.pointOne.y
    );
  }
}
module.exports = { Lobby, User, Host, GameObject, Hitbox, GameObjectBuilder, Vector };
