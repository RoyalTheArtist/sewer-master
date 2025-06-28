import { Entity, System } from '@engine/ecs'
import { AI } from '../ai'
import { ActionQueue, NoAction } from '../actions'
import { Actor } from '../../modules/actors/actors'


export class TurnSystem extends System {
    public componentsRequired = new Set([AI])
    private queue: Set<AI> = new Set()
    private currentTurn: AI | null = null
    private tookTurn: Set<AI> = new Set()
    public query(entities: Set<Entity>): void {
        for (const entity of entities) {
            if (entity.hasAll(this.componentsRequired) && !this.queue.has(entity.getComponent(AI)) && !this.tookTurn.has(entity.getComponent(AI))) {
                this.components.add(entity.getComponent(AI))
                this.queue.add(entity.getComponent(AI))
            }
        }
    }

    public update(_delta: number): void {
        if (!this.currentTurn) {
            const [first] = this.queue
            this.currentTurn = first
        }

        const action = this.currentTurn?.perform(this.currentTurn.parent)

        if (action && !(action instanceof NoAction) && action.canPerform(this.currentTurn.parent)) {
            ActionQueue.addAction(this.currentTurn.parent as Actor, action, 135)
            this.queue.delete(this.currentTurn)
            this.tookTurn.add(this.currentTurn)
            const [nextTurn] = this.queue
            this.currentTurn = nextTurn
        }

        if (this.queue.size === 0) {
            this.queue = new Set(this.tookTurn)
            this.tookTurn = new Set()
        }
    }
}