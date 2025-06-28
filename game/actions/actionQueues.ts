import { Action } from "./moveActions"
import { Entity } from "@engine/ecs"
import { ImpossibleException } from "@engine/utils/"


export type ActionRequest = {
    entity: Entity,
    action: Action,
    duration: number
}

export class ActionQueue {
    static actionQueue: Set<ActionRequest> = new Set()
    static actionsToClear: Map<Entity, number> = new Map()
    static currentTime = performance.now()

    static addAction(entity: Entity, action: Action, duration: number = 0) {
        if (this.actionsToClear.has(entity)) return

        for (let request of this.actionQueue) {
            if (request.entity === entity) {
                return
            }
        }
        this.actionQueue.add({ entity, action, duration })
    }

    static processActions(delta: number) {
        this.currentTime = performance.now()
        for (let request of this.actionQueue) {
            try {
                request.action.perform(request.entity)
                
            } catch (error) {
                if (error instanceof ImpossibleException) {
                    console.warn(error.message)
                }
            }
            
            if (request.duration > 0) {
                // write timeout clear
                this.actionsToClear.set(request.entity, request.duration)
            }
            this.actionQueue.delete(request)
        }
        
        this.clear(delta)
    }
    
    static clear(delta: number) {
        for (let [entity, duration] of this.actionsToClear) {
            this.actionsToClear.set(entity, duration - delta)

            if (duration <= 0) {
                this.actionsToClear.delete(entity)
            }
        }
    }
}