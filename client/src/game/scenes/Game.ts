import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { Vector, ClientGameObject, ClientPlayer } from "../ClientModels";

export class Game extends Scene {
    private maxTiltAngle: number = 40;
    private renderedObjectState: Map<string, Phaser.Physics.Arcade.Sprite> =
        new Map();

    private lerpPositionMap: Map<Phaser.Physics.Arcade.Sprite, Vector> =
        new Map();

    constructor() {
        super("Game");
    }

    preload() {
        this.load.atlas("bus", "assets/bus.png", "assets/bus.json");
        this.load.image("pipe", "flappy-bird-assets/sprites/pipe-green.png");
    }

    update() {
        this.rotateBody();
        const lerpFactor = 0.05;
        this.lerpPositionMap.forEach((target, sprite) => {
            const x = this.lerp(sprite.x, target.x, lerpFactor);
            const y = this.lerp(sprite.y, target.y, lerpFactor);
            sprite.setPosition(x, y);
        });
        // if(this.bus && this.busDisplayName) {
        //     const x = this.lerp(this.bus.x - 25,this.busDisplayName.x, this.lerpFactor);
        //     const y = this.lerp(this.bus.y - 50,this.busDisplayName.y, this.lerpFactor);
        //     this.busDisplayName.setPosition(x,y);
        // }
    }

    rotateBody() {
        // if (!this.bus.body) {
        //     return;
        // }
        // let targetRotation = 0;
        // if (this.bus.body.velocity.y > 0) {
        //     targetRotation = Phaser.Math.DegToRad(this.maxTiltAngle);
        // } else if (this.bus.body.velocity.y < 0) {
        //     targetRotation = Phaser.Math.DegToRad(-this.maxTiltAngle);
        // }
        // this.bus.rotation = this.lerp(this.bus.rotation, targetRotation, 0.01);
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
            frames: busFrames, // Use the dynamically generated frames
            frameRate: 10, // The animation speed, adjust as necessary
            repeat: 0, // Repeat the animation indefinitely
        });
        this.input.keyboard?.on("keydown-SPACE", () => {
            EventBus.emit("drive");
        });

        EventBus.on(
            "update",
            (data: {
                objectId: string;
                object: ClientGameObject;
                lerp: boolean;
            }) => {
                this.render(data.objectId,data.object,data.lerp);
            },
        );

        EventBus.on("player-drive", (playerId: string) => {
            const player = this.renderedObjectState.get(playerId);
            if (!player) {
                return;
            }
            console.log(playerId);
            player.anims.play("drive");
        });
    }

    render(objectId : string, obj : ClientGameObject, lerp : boolean) {
        if (!this.renderedObjectState.has(objectId)) {
            const object = this.createRenderObject(obj);
            if (object) {
                this.renderedObjectState.set(objectId, object);
            }
        } else {
            const object = this.renderedObjectState.get(objectId);
            if (object) {
                const target = new Vector(
                    obj.position.x,
                    obj.position.y,
                );
                if(!lerp) {
                    object.setPosition(obj.position.x,obj.position.y);
                }
                this.lerpPositionMap.set(object, target);
            }
        }
    }

    createRenderObject(object: ClientGameObject) {
        const type = object.type;
        if (type === "pipe") {
            return this.physics.add
                .sprite(object.position.x, object.position.y, "pipe")
                .setImmovable(true);
        }
        if (type === "player") {
            return this.physics.add.sprite(
                object.position.x,
                object.position.y,
                "bus",
            );
        }
    }
}

