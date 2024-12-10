class User {
    /**
     * 
     * @param {string} name 
     * @param {string} password
     * @param {number} join_date 
     * @param {string} id 
     */
    constructor(name, password, timestamp, id) {
        this.name = name;
        this.password = password;
        this.timestamp = timestamp;
        this.id = id;
    }
}
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
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
        const halfWidth1 = this.dimensions.x / 2;
        const halfHeight1 = this.dimensions.y / 2;
        const halfWidth2 = obj2.dimensions.x / 2;
        const halfHeight2 = obj2.dimensions.y / 2;
    
        const horizontalCollision = Math.abs(this.position.x - obj2.position.x) < (halfWidth1 + halfWidth2);
        const verticalCollision = Math.abs(this.position.y - obj2.position.y) < (halfHeight1 + halfHeight2);
    
        return horizontalCollision && verticalCollision;
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
        this.dimensions = new Vector(0,0);
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
    /**
     * 
     * @param {GameObject} leader 
     */
    constructor(leader) {
        super(leader.type, leader.position, leader.velocity, leader.name, leader.gravity, leader.properties, leader.dimensions, leader.rotation);
        this.followers = new Map();
    }
    /**
     * @param {string} id
     * @param {GameObject} follower 
     * @param {Vector} offset 
     * @returns {LeaderObject}
     */
    addFollower(id, follower, offset) {
        this.followers.set(id, {follower,offset: new Vector(offset.x,offset.y)});
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

    collides(obj2) {
        let b = super.collides(obj2);
        this.followers.forEach((value,id) => {
            const { follower } = value; 
            b = follower.collides(obj2) || b;
        });
        return b;
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
module.exports = { User, GameObject, GameObjectBuilder, Vector, LeaderObject };
