import { Action } from "./moveActions"

import { Entity } from "@engine/ecs"
import { ImpossibleException } from "@engine/utils/exceptions"
import { Actor, } from "@modules/actors/actors"
import { Inventory } from "@modules/actors/components/inventory"

export class PickupAction extends Action {
    canPerform(): {} {
        throw new Error("Method not implemented.")
    }
    perform(entity: Entity) {
        const consumer = entity as Actor
        if (!consumer) return

        if (!consumer.hasComponent(Inventory)) throw new ImpossibleException("Can't pick up, no inventory")

        // TODO: Implement picking up an item
        //const inventory = consumer.getComponent(Inventory)
        // const { position  } = consumer

        // for (const item of inventory.items) {

        //     // if (position.x === item.x && position.y === item.y) {

        //     //     // if (inventory.items.length >= inventory.capacity) {
        //     //     //     throw new ImpossibleException('Your inventory is full')
        //     //     // }

        //     //     // //gameMap.removeEntity(item)
        //     //     // item.parent = inventory
        //     //     inventory.items.push(item)

        //     //     //window.messageLog.addMessage(`You picked up the ${item.name}`)
        //     //     return
        //     // }
        // }
        throw new ImpossibleException('There is nothing here to pickup')
    }
}