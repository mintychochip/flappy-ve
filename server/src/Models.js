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

class Hitbox {
    constructor(origin, one, two) {
        this.one = one;
        this.two = two;
    }


}

class GameObject {

    constructor(type, position, velocity, name, gravity, properties, dimensions) {
        this.type = type;
        this.position = position;
        this.velocity = velocity;
        this.name = name;
        this.gravity = gravity;
        this.properties = properties;
        this.dimensions = dimensions;
    }

    update(deltaTime) {
        if (this.gravity) {
            this.velocity.y += this.gravity * deltaTime;
        }
        let displacementY = this.position.y + this.velocity.y;
        let displacementX = this.position.x + this.velocity.x;
        if (this.properties.bounded) {
            displacementY = Math.max(0, displacementY);
            displacementX = Math.max(0, displacementX);
        }
        this.position.y = displacementY;
        this.position.x = displacementX;
    }

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }

    /**
     *
     * @param {GameObject} obj2
     * @returns {boolean}
     */
    collides(obj2) {
        return (
            this.position.x < obj2.position.x + obj2.properties.width &&
            this.position.x + this.properties.width > obj2.position.x &&
            this.position.y < obj2.position.y + obj2.properties.height &&
            this.position.y + this.properties.height > obj2.position.y
        );
    }
}

class GameObjectBuilder {
    constructor(type = 'default') {
        this.type = type;
        this.position = new Vector(0, 0);
        this.velocity = new Vector(0, 0);
        this.dimensions = {width: 0, height: 0};
        this.gravity = 0;
        this.name = '';
        this.properties = {
          bounded: false,};
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

    setWidth(width) {
      this.dimensions.width = width;
      return this;
    }

    setHeight(height) {
      this.dimensions.height = height;
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
            this.properties,
            this.dimensions
        );
    }
}

module.exports = {Lobby, User, Host, GameObject, Hitbox, GameObjectBuilder, Vector};
