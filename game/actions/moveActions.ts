import { Entity } from "@engine/ecs"

import { ImpossibleException, Vector2D } from "@engine/utils"
import { Actor } from "@modules/actors"
import { TakeDamage } from "@modules/combat/fighter"

export abstract class Action {
    private _parent: Actor | null = null

    public get requester(): Actor | null { return this._parent }
    public set requester(parent: Actor) { this._parent = parent }

    abstract perform(actor: Entity): void
    abstract canPerform(actor: Actor): {}
}

export class NoAction extends Action {
    perform(_entity: Entity): void { }
    canPerform() { return true }
 }

export class MoveAction extends Action {
    constructor(public direction: Vector2D) {
        super()
    }

    public get moveTo(): Vector2D {
        if (!this.requester) return new Vector2D(0, 0)
        return new Vector2D(this.requester.position.x + this.direction.x, this.requester.position.y + this.direction.y)
    }
    perform(entity: Actor) {
        if (!this.canPerform()) throw new ImpossibleException("Can't move there")
        entity.moveTo(this.direction)
    }

    /**
     * Checks if the move is valid. That is, if the target destination is within the map's bounds
     * and there is no entity blocking the path.
     * @returns {boolean} true if the move is valid, false otherwise
     */
    canPerform() {
        if (!this.requester || !this.requester.parent) return false
        const map = this.requester.parent
        
        return map.isWalkable(this.moveTo) && map.isInBounds(this.moveTo) && !map.entityBlocks(this.moveTo)
     }
}

export abstract class ActionWithDirection extends Action { 
    constructor(public dest: Vector2D) { 
        super()
    }

    
    abstract perform(entity: Entity): void
}

export class MeleeAction extends ActionWithDirection {
    canPerform(): {} {
        return true
    }
    perform(entity: Actor) {
        if (!entity.parent) return new NoAction()
        const map = entity.parent 
        const target = map.findEntity(new Vector2D(entity.position.x + this.dest.x, entity.position.y + this.dest.y))
        if (!target) throw new ImpossibleException("cannot attack the air")
        
        target.addComponent(new TakeDamage(entity, 5))
    }
}

export class BumpAction extends ActionWithDirection {
    canPerform(actor: Actor): {} {
        const map = actor.parent
        if (!map) return false
        const destination = new Vector2D(actor.position.x + this.dest.x, actor.position.y + this.dest.y)
        return map.isWalkable(destination) && map.isInBounds(destination)
    }
    perform(entity: Actor) {
        if (!entity.parent) return new NoAction()
        const map = entity.parent 
        const dest = new Vector2D(entity.position.x + this.dest.x, entity.position.y + this.dest.y)


        if (map.entityBlocks(dest)) {
            return new MeleeAction(this.dest).perform(entity)
        } else {
            const moveAction = new MoveAction(this.dest)
            moveAction.requester = entity
            return moveAction.perform(entity)
        }
    }
}

