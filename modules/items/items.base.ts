
import { Position } from "../components";
import { Entity } from "@engine/ecs";
import { Vector2D } from "@engine/utils";
import { GameMap } from "../map/map";
import { ActorAppearance } from '../actors/components/appearance';

export abstract class Item extends Entity {
    public parent: GameMap | null = null
    constructor() {
        super()
    }

    static makeScroll(position?: Vector2D) {
        const scroll = new HealingScroll()
        scroll.name = "healinh scroll"
        if (position) {
            scroll.addComponent(new Position(position))
        }
        scroll.addComponent(new ActorAppearance("scroll", { 
            resource: "assets/images/dungeon_sewers_002.png",
            size: [16, 16]
         }, [0, 2]))
        scroll.initialize()
        return scroll
    }
}

export abstract class Consumable extends Item {
    constructor() {
        super()
    }
}

export class HealingScroll extends Consumable {}