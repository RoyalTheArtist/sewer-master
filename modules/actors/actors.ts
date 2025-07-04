import { Entity } from "@engine/ecs";
import { Vector2D } from "@engine/utils";
import { GameMap } from "@modules/map/map";
import { Settings } from "@/settings";
import { Position, BlocksMovement } from "../components";
import { MoveSpriteAnimation } from "@modules/animations";

import { ActorAppearance } from "./components/appearance";
import { Inventory } from "./components/inventory";
import { AnimationManager } from "@engine/render/graphics/animations";
import { Active, AI, selectAI } from "../../game/ai";
import { Fighter } from "../combat/fighter";


const TILE_SIZE = Settings.tiles.size

interface ActorLoadData {
    name: string,
    position: {x: number, y: number},
    stats?: {
        health: number,
        maxHealth: number
    }
    ai: "player" | "random",
    appearance: {
        looksLike: string
        spritesheet: {
            resource: "assets/images/dungeon_sewers_002.png",
            size: [16, 16]
        },
        dimension: [number, number]
    }
}

const RAT_SPAWN: ActorLoadData = {
    name: "Rat",
    position: { x: 0, y: 0 },
    ai: "random",
    appearance: {
        looksLike: "rat",
        spritesheet: {
            resource: "assets/images/dungeon_sewers_002.png",
            size: [16, 16]
        },
        dimension: [0, 1]
    }
}

export class Actor extends Entity {
    parent: GameMap | null = null
    name: string = "Unnamed Actor"

    constructor(name: string = "Unnamed Actor") {
        super()
        this.name = name
    }

    public addPosition(x: number, y: number) {
        this.addComponent(new Position(new Vector2D(x, y)));
        return this
    }

    public addAppearance(looksLike: string, spritesheet: { resource: string, size: [number, number] }, dimensions: [number, number]) {
        this.addComponent(new ActorAppearance(looksLike, spritesheet, dimensions));
        return this
    }

    public addAI(ai: AI) { this.addComponent(ai); return this }

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
        const rat = buildActor(RAT_SPAWN, position)
        rat.addComponent(new Fighter(10))
        rat.addComponent(new Active())
        return rat
    }
}

const buildActor = (data: ActorLoadData, position: Vector2D) => {
    const actor = new Actor(data.name)
    const ai = selectAI(actor, data.ai)

    actor
        .addPosition(position.x, position.y)
        .addAppearance(data.appearance.looksLike, data.appearance.spritesheet, data.appearance.dimension)
        .addAI(ai)
        .initialize()
    
    actor.addComponent(new BlocksMovement())
    if (data.stats) {
        actor.addComponent(new Fighter(data.stats.health))
    }

    return actor
}