export class ClientGameObject {
    constructor(
        public readonly type: string,
        public readonly position: Vector,
        public readonly velocity: Vector,
        public readonly name: string,
        public readonly gravity: number,
        public readonly dimensions: Vector,
        public readonly properties: GameObjectProperties
    ) {}
}

export class GameObjectProperties {
    constructor(
        public readonly bounded: boolean,
    ) {}
}
export class Vector {
    constructor(
        public readonly x: number,
        public readonly y: number
    ) {}
}

export class ClientHitbox {
    constructor(
        public readonly pointOne: Vector,
        public readonly pointTwo: Vector
    ) {}
}

export class ClientPlayer extends ClientGameObject {
    public readonly name: string;

    constructor(
        name: string, 
        type: string, 
        position: Vector, 
        hitbox: ClientHitbox, 
        lerp: boolean
    ) {
        super(type, position, hitbox, lerp); 
        this.name = name; 
    }
}