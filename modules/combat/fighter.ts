import { Component, Entity, System } from "@engine/ecs";
import { IInitialize, IUpdate } from "@engine/update.h";
import { Actor } from "@modules/actors/actors";

/* This component marks an entity as having a set amount of health that can lead to destruction. */
export class Fighter extends Component implements IInitialize, IUpdate {
    constructor(public health: number) { super() }
}

export class TakeDamage extends Component {
    constructor(public attacker: Actor, public amount: number) { super() }
}

export class CombatSystem extends System implements IUpdate {
    public componentsRequired = new Set<Function>([Fighter,TakeDamage]);
    public query(entities: Set<Entity>): void {
        for (const entity of entities) {
                    if (entity.hasAll(this.componentsRequired)) {
                        this.components.add(entity.getComponent(TakeDamage))
                    }
                }
    }
    update(_delta: number) { 
        for (const component of this.components as Set<TakeDamage>) {
            if (component.parent === null) { continue }
            component.parent.getComponent(Fighter).health -= component.amount
            component.parent.removeComponent(TakeDamage)
            this.components.delete(component)
            console.log(`${component.attacker.name} damaged ${component.parent.name} for ${component.amount}`)
        }
    }
}

