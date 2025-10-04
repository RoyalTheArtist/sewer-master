

import { ComponentContainer, ECS, Entity } from "../ecs"

export abstract class Action {
    public parent: Entity | null = null

    public get requester(): Entity | null { return this.parent }
    public set requester(parent: Entity) { this.parent = parent }

    abstract perform(container: ComponentContainer,...args: any[]): boolean
    abstract canPerform(...args: any[]): boolean
}

export class NoAction extends Action {
    perform(): boolean { return false }
    canPerform() { return true }
}


