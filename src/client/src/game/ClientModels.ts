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

export interface Player extends GameObject {
    alive: boolean
}
export interface Vector {
    x: number
    y: number
}

export interface MatchResult {
    id: number
    match_id: number
    score: number
    user_id: string
    name: string
}
