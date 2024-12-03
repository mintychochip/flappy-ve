import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { Vector, ClientGameObject } from "../ClientModels";

/*TODO:
- Render Background Scene
*/

class RenderObject {
    constructor(
        public readonly sprite: Phaser.Physics.Arcade.Sprite,
        public meta: ClientGameObject,
    ) {}
}
export class Game extends Scene {
    private maxTiltAngle: number = 40;
    private renderedObjects: Map<string, RenderObject> = new Map();

    private lerpSet: Set<string> = new Set();
    constructor() {
        super("Game");
    }

    preload() {
        this.load.atlas("bus", "assets/bus.png", "assets/bus.json");
        this.load.image("pipe", "assets/pipe-green.png");
    }

    update() {
        const lerpFactor = 0.05;
        this.renderedObjects.forEach((object, id) => {
            if (object) {
                const {position, type,velocity } = object.meta;
                const { sprite } = object;
                if (this.lerpSet.has(id)) {   
                    const x = this.lerp(sprite.x, position.x, lerpFactor);
                    const y = this.lerp(sprite.y, position.y, lerpFactor);
                    sprite.setPosition(x, y);
                } else {
                    sprite.setPosition(position.x,position.y);
                }

                if(type === 'player') {
                    let target = 0;
                    if(velocity.y > 0) {
                        target = Phaser.Math.DegToRad(this.maxTiltAngle);
                    } else if (velocity.y < 0) {
                        target = Phaser.Math.DegToRad(-this.maxTiltAngle);
                    }
                    sprite.rotation =  this.lerp(sprite.rotation,target,0.01);
                }
            }
        });
    }

    lerp(current: number, target: number, lerpFactor: number) {
        return current + (target - current) * lerpFactor;
    }

    create() {
        const busFrames = this.anims.generateFrameNames("bus", {
            start: 0,
            end: 3,
            zeroPad: 1,
            prefix: "bus ",
            suffix: ".aseprite",
        });
        this.anims.create({
            key: "drive",
            frames: busFrames,
            frameRate: 15,
            repeat: 0, 
        });

        this.input.keyboard?.on('keydown-SPACE',() => {
            EventBus.emit('drive');
        })

        EventBus.on(
            "update",
            (data: {
                objectId: string;
                object: ClientGameObject;
                lerp: boolean;
            }) => {
                this.render(data.objectId, data.object, data.lerp);
            },
        );

        EventBus.on("player-drive", (playerId: string) => {
            const player = this.renderedObjects.get(playerId);
            if (!player) {
                return;
            }
            console.log(playerId);
            player.sprite.anims.play("drive");
        });
    }
    render(objectId: string, obj: ClientGameObject, lerp: boolean): void {
        let object = this.renderedObjects.get(objectId);

        if (!object) {
            object = this.createRender(obj);
            if (object) this.renderedObjects.set(objectId, object);
        }

        if (object) {
            object.meta = obj;
            if (!lerp) {
                this.lerpSet.delete(objectId);
            } else {
                this.lerpSet.add(objectId);
            }
        }
    }

    createRender(object: ClientGameObject): RenderObject | undefined {
        const { x, y } = object.position;
        const { type } = object;
        if (type === "pipe") {
            return new RenderObject(
                this.physics.add.sprite(x, y, "pipe").setImmovable(true),
                object,
            );
        }
        if (type === "player") {
            const group = new LeaderGroup(this, x, y, "bus").addFollower(
                this.add.text(x, y, object.name),
                new Vector(-20, -50),
            );
            return new RenderObject(group, object);
        }
    }
}
interface Positionable {
    setPosition(x: number, y: number): this;
}
class LeaderGroup extends Phaser.Physics.Arcade.Sprite {
    private followers: Map<Positionable, Vector> = new Map();
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.world.enable(this);
    }

    addFollower(follower: Positionable, offset: Vector) {
        this.followers.set(follower, offset);
        return this;
    }

    setPosition(x: number, y: number) {
        super.setPosition(x, y);
        if (!this.followers) {
            return this;
        }
        this.followers.forEach((offset, follower) => {
            follower.setPosition(x + offset.x, y + offset.y);
        });
        return this;
    }
}
