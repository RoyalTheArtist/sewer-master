import { AI } from "@/tinyquest/components/ai"
import { System, Entity } from "../../ecs"
import { InQueue, MakeActive } from "./components"
import { NoAction } from "@/tinyquest/actions/action"

export class WakeupSystem extends System {
    componentsRequired = new Set([AI, MakeActive])
    combat: CombatSystem
    constructor(combat: CombatSystem) {
        super()
        this.combat = combat
    }
    update(entities: Set<Entity>) {
        for (const entity of entities) {
            this.ecs.addComponent(entity, new InQueue())
            this.ecs.removeComponent(entity, MakeActive)
        }
    }   
}

export class CombatSystem extends System {
    componentsRequired = new Set([AI, InQueue])
    tookTurn: Set<Entity> = new Set()
    currentTurn: Entity | null = null
    update(entities: Set<Entity>) { 
        for (const entity of entities) {
            if (this.tookTurn.has(entity)) {
                continue
            }
           
            if (!this.takeTurn(entity)) {
                return
            }

            this.tookTurn.add(entity)
        }

        this.tookTurn.clear()
    }

    takeTurn(entity: Entity) {
        const container = this.ecs.getComponents(entity)
        if (!container) throw new Error(`No container for entity ${entity}`)
        const ai = container.getOfType(AI)
        if (!ai) {
            this.tookTurn.add(entity)
            return true
        }

        const action = ai.perform()
        if (action && !(action instanceof NoAction)) {
            return action.perform(container)
        }
    }
}
