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

export enum ClientGameEvent {
    DRIVE = 'drive',
}