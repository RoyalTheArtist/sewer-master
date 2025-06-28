import { Component } from "@engine/ecs"
import { Action, MoveAction, NoAction } from "./actions"
import { Actor } from "../modules/actors/actors"
import { Vector2D } from "@engine/utils/vectors"

export class AI implements Component {
    public parent: Actor

    constructor(parent: Actor) { this.parent = parent }
    public  initialize(): void {}
    public  update(_delta: number): void {}
    public  perform(_entity: Actor): Action | null { return new NoAction() }
}

const RandomNumber = (min: number, max: number) => Math.round(Math.random() * (max - min) + min)

export class RandomMovementAI extends AI {
    constructor(parent: Actor) { super(parent) }
    public initialize(): void {
    }
    public update(_delta: number): void {
        
    }
    public perform(entity: Actor): Action {
        const direction = new Vector2D(RandomNumber(-1, 1), RandomNumber(-1, 1))
        const action = new MoveAction(direction)
        action.requester = entity
        return action
    }
}