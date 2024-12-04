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

    constructor(type, position, velocity, name, gravity, properties, dimensions, rotation) {
        this.type = type;
        this.position = position;
        this.velocity = velocity;
        this.name = name;
        this.gravity = gravity;
        this.properties = properties;
        this.dimensions = dimensions;
        this.rotation = rotation;
    }

    update(deltaTime, boundX = 0, boundY = 0) {
        if (this.gravity) {
            this.velocity.y += this.gravity * deltaTime;
        }
        let displacementY = this.position.y + this.velocity.y;
        let displacementX = this.position.x + this.velocity.x;
        if (this.properties.bounded) {
            displacementY = Math.max(0, displacementY);
            displacementX = Math.max(0, displacementX);

            displacementY = Math.min(boundY, displacementY);
            displacementX = Math.min(boundX, displacementX);
        }
        this.setPosition(displacementX,displacementY);
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

    clone() {
        return new GameObject(this.type,this.position,this.velocity,this.name,this.gravity,this.properties,this.dimensions,this.rotation);
    }
}

class GameObjectBuilder {
    constructor(type = 'default') {
        this.type = type;
        this.position = new Vector(0, 0);
        this.velocity = new Vector(0, 0);
        this.dimensions = { width: 0, height: 0 };
        this.gravity = 0;
        this.name = '';
        this.properties = {
            bounded: false,
        };
        this.rotation = 0;
    }

    setRotation(rotation) {
        this.rotation = rotation;
        return this;
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
    setDimensions(dimensions) {
        this.dimensions = dimensions;
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
            this.dimensions,
            this.rotation
        );
    }
}
class LeaderObject extends GameObject {
    constructor(leader) {
        super(leader.type, leader.position, leader.velocity, leader.name, leader.gravity, leader.properties, leader.dimensions, leader.rotation);
        this.followers = new Map();
    }
    /**
     * 
     * @param {GameObject} follower 
     * @param {Vector} offset 
     * @returns {LeaderObject}
     */
    addFollower(id, follower, offset) {
        this.followers.set(id, {follower,offset});
        return this;
    }

    setPosition(x, y) {
        super.setPosition(x, y);
        this.followers.forEach((value, id) => {
            const {follower,offset} = value;
            const finalX = x + offset.x;
            const finalY = y + offset.y;
            follower.setPosition(finalX, finalY);
        });
    }

    flatten(leaderId) {
        const flatMap = new Map();

        flatMap.set(leaderId,this.clone());
        
        this.followers.forEach((value,id) => {
            const { follower } = value;
            const clone = follower.clone();
            flatMap.set(id,clone);
        });
        return flatMap;
    }
}
module.exports = { Lobby, User, Host, GameObject, Hitbox, GameObjectBuilder, Vector, LeaderObject };
