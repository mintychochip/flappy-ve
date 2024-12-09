export interface GameObject {
    type: string
    position: Vector
    velocity: Vector
    name: string
    gravity: number
    dimensions: Vector
    properties: {
        bounded: boolean
    }
    rotation: number
}

export interface Vector {
    x: number
    y: number
}

export enum ClientGameEvent {
    DRIVE = 'drive',
}
