import { Vector2D } from "@engine/utils"
import { Component, Entity, System } from "../ecs"
import { Position } from "../components/position"

export class MoveEntity extends Component {
    constructor(public destination: Vector2D) {
        super()
    }
}

export class MovementSystem extends System {
    componentsRequired = new Set([Position, MoveEntity])
    update(entities: Set<Entity>) {
        for (const entity of entities) {
            const container = this.ecs.getComponents(entity)
            if (!container) throw new Error(`No container for entity ${entity}`)
            const moveTo = container.getOfType(MoveEntity)
            if (moveTo) {
                console.debug(`Moving ${entity} to { x: ${moveTo.destination.x}, y: ${moveTo.destination.y} }`)
                const position = container.get(Position)
                if (!position) throw new Error(`No position for entity ${entity}`)
                position.x = moveTo.destination.x
                position.y = moveTo.destination.y
                container.ecs.removeComponent(entity, MoveEntity)
            }
        }
    }
}
