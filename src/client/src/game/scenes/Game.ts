import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { Vector, GameObject, Player } from "../ClientModels";

interface RenderObject {
    sprite: Phaser.Physics.Arcade.Sprite;
    meta: GameObject;
}
interface Follower {
    setPosition(x: number, y: number): this;
    destroy(): void;
}
export class Game extends Scene {
    private maxTiltAngle: number = 40;
    private renderedObjects: Map<string, RenderObject> = new Map();
    private lerpSet: Set<string> = new Set();
    constructor() {
        super("Game");
    }

    preload() {
        this.load.setPath("assets");
        this.load.atlas("bus", "bus.png", "bus.json");
        this.load.image("pipe", "pipe-green.png");
        this.load.image("background", "background-night.png");
    }

    background() {
        const vh = this.cameras.main.height;
        const image = this.add.image(0, 0, "background");
        const scale = vh / image.height;
        const bg = this.add.tileSprite(
            0,
            0,
            this.cameras.main.width,
            vh,
            "background",
        );

        bg.setOrigin(0, 0);
        bg.setScale(scale);
    }

    update() {
        const lerpFactor = 0.4;
        this.renderedObjects.forEach((object, id) => {
            if (object) {
                const { position, type, velocity } = object.meta;
                const { sprite } = object;
                if (this.lerpSet.has(id)) {
                    const x = this.lerp(sprite.x, position.x, lerpFactor);
                    const y = this.lerp(sprite.y, position.y, lerpFactor);
                    sprite.setPosition(x, y);
                } else {
                    sprite.setPosition(position.x, position.y);
                }

                if (type === "player") {
                    let target = 0;
                    if (velocity.y > 0) {
                        target = Phaser.Math.DegToRad(this.maxTiltAngle);
                    } else if (velocity.y < 0) {
                        target = Phaser.Math.DegToRad(-this.maxTiltAngle);
                    }
                    sprite.rotation = this.lerp(sprite.rotation, target, 0.05);
                }
            }
        });
    }

    lerp(current: number, target: number, lerpFactor: number) {
        return current + (target - current) * lerpFactor;
    }

    create() {
        this.background();
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

        this.input.keyboard?.on("keydown-SPACE", () => {
            EventBus.emit("drive");
        });

        EventBus.on("player-drive", (playerId: string) => {
            const player = this.renderedObjects.get(playerId);
            if (!player) {
                return;
            }
            player.sprite.anims.play("drive");
        });

        EventBus.on("update", (data: any) => {
            this.render(data.objectId, data.object, data.lerp);
        });
    }
    render(objectId: string, obj: GameObject, lerp: boolean): void {
        let object;
        const playerDead = isPlayer(obj) && !obj.alive;
        if (this.renderedObjects.has(objectId)) {
            object = this.renderedObjects.get(objectId);
            if (playerDead && object) {
                const { sprite } = object;
                sprite.destroy();
                this.renderedObjects.delete(objectId);
                return;
            }
        } else {
            if(playerDead) {
               return;
            }
            object = this.createRender(obj);
        }
        if (object) {
            this.renderedObjects.set(objectId, object);
            object.meta = obj;
            lerp ? this.lerpSet.add(objectId) : this.lerpSet.delete(objectId);
        }
    }

    createRender(object: GameObject): RenderObject | undefined {
        const { x, y } = object.position;
        const { type } = object;
        if (type.includes("pipe")) {
            return {
                sprite: this.physics.add
                    .sprite(x, y, "pipe")
                    .setImmovable(true)
                    .setAngle(object.rotation),
                meta: object,
            };
        }
        if (type === "player") {
            const sprite = new LeaderGroup(this, x, y, "bus").addFollower(
                this.add.text(x, y, object.name),
                calculateOffset(object.name),
            );
            return { sprite, meta: object };
        }
    }
}
function calculateOffset(name: string): Vector {
    const x = -5 * name.length + -5;
    return { x, y: -40 };
}
function isPlayer(object: GameObject): object is Player {
    return (object as Player).alive !== undefined;
}
class LeaderGroup extends Phaser.Physics.Arcade.Sprite {
    private followers: Map<Follower, Vector> = new Map();
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.world.enable(this);
    }

    addFollower(follower: Follower, offset: Vector) {
        this.followers.set(follower, offset);
        return this;
    }

    destroy() {
        super.destroy();
        this.followers.forEach((offset,follower) => {
            follower.destroy();
        })
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
