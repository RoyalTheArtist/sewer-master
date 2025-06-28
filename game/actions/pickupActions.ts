
import { Vector2D } from "@engine/utils/vectors";
import { Action } from "./moveActions";
import { Actor } from "@modules/actors";
import { Item } from "@modules/items/items.base";
import { ImpossibleException } from "@engine/utils";
import { Inventory } from "@modules/actors/actors.components";
import { Position } from "@modules/components";

export class PickupAction extends Action {
    constructor(public destination: Vector2D) { super() }
    canPerform(actor: Actor) { 
        if (!actor.hasComponent(Inventory)) return false
        const map = actor.parent
        const items = map?.findEntities(this.destination)
        if (!items) return false

        for (const item of items) {
            if (item instanceof Item) return true
        }
        return false
    }
    perform(actor: Actor) { 
        const map = actor.parent
        const items = map?.findEntities(this.destination)
        if (!items) throw new ImpossibleException('There is nothing here to pickup')

        for (const item of items) {
            if (item instanceof Item) {
                const inventory = actor.getComponent(Inventory)
                if (!inventory) throw new ImpossibleException('Can\'t pick up, no inventory')
                inventory.addItem(item)
                item.removeComponent(Position)
                map?.removeEntity(item)
                break
            }
        }
    }
}