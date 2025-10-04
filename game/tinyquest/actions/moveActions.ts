
import { Vector2D } from "@engine/utils/vectors"
import { Action } from "./action"
import { ImpossibleException } from "@engine/utils/exceptions"
import { ComponentContainer } from "../ecs"
import { Position, World } from "../components"
import { TinyMap } from "../tinyMap"
import { MoveEntity } from "../systems/movement"

export abstract class ActionWithDirection extends Action { 
    constructor(public destination: Vector2D) { 
        super()
    }
}
 

export class BumpAction extends ActionWithDirection {
    perform(container: ComponentContainer): boolean { return new MoveAction(this.destination).perform(container) }
    canPerform() { return true }
}

export class MoveAction extends ActionWithDirection {
    position: Position | null = null
    constructor(public direction: Vector2D) {
        super(direction)
    }

    public get moveTo(): Vector2D {
        if (!this.requester) return new Vector2D(0, 0)
        return new Vector2D(0,0)
    }
    perform(container: ComponentContainer): boolean {
        const position = container.get(Position)
        const world = container.get(World)
        if (!position || !world) throw new Error(`No position for entity ${this.requester}`)
        const dest = new Vector2D(position.x + this.direction.x, position.y + this.direction.y)
        
        if (!this.canPerform(dest, world.map)) throw new ImpossibleException("Can't move there")
        container.ecs.addComponent(container.entity, new MoveEntity(dest))
        return true
    }

    /**
     * Checks if the move is valid. That is, if the target destination is within the map's bounds
     * and there is no entity blocking the path.
     * @returns {boolean} true if the move is valid, false otherwise
     */
    canPerform(dest: Vector2D, map: TinyMap): boolean {
        const isWalkable = map.isWalkable(dest.x, dest.y)
        return isWalkable
        // if (!this.requester || !this.requester.parent) return false
        // const map = this.requester.parent

        // const entityBlocks = map.entityBlocks(this.moveTo)
        
        // return map.isWalkable(this.moveTo) && map.isInBounds(this.moveTo) && !entityBlocks
     }
}