
import { Entity } from "@engine/ecs";
import { Vector2D } from "@engine/utils";
import { GameMap } from "@modules/map";
import { Settings } from "@game/apps/settings";
import { Position, BlocksMovement } from "../components";
import { MoveSpriteAnimation } from "@modules/animations";

import { ActorAppearance, Inventory } from "./actors.components";
import { AnimationManager } from "@engine/graphics/animations";
import { RandomMovementAI } from "../../game/ai";
import { Fighter } from "../combat/fighter";


const TILE_SIZE = Settings.tiles.size

export class Actor extends Entity {
    parent: GameMap | null = null
    name: string = "Unnamed Actor"
    public get position() {
        if (this.hasComponent(Position)) {
            return this.getComponent<Position>(Position).position
        }
        return new Vector2D(0, 0)
    }

    public initialize(): void {
        this.addComponent(new Inventory(10));
        super.initialize();
    }

    public moveTo(direction: Vector2D) {
        const entityPos = this.getComponent<Position>(Position)
        const newPosition = new Vector2D(entityPos.position.x + direction.x, entityPos.position.y + direction.y)
        const curTilePos = new Vector2D(entityPos.position.x * TILE_SIZE.x, Math.floor(entityPos.position.y * TILE_SIZE.y))
        const nextTilePos = new Vector2D(Math.floor(newPosition.x * TILE_SIZE.x), Math.floor(newPosition.y * TILE_SIZE.y))

        AnimationManager.triggerAnimation(new MoveSpriteAnimation(this, curTilePos, nextTilePos, 100))
        entityPos.position = newPosition
        //this.position = newPosition
    }

    static spawnRat(position: Vector2D) {
        const rat = new Actor()
        rat.name = "rat"
        rat.addComponent(new Position(position))
        rat.addComponent(new ActorAppearance({ shape: "circle", resource: "sewers", sprite: "rat" }))
        rat.addComponent(new RandomMovementAI(rat))
        rat.addComponent(new Fighter(10))
        rat.addComponent(new BlocksMovement)
        rat.initialize()
        return rat
    }
}