import { Component } from "@engine/ecs"
import { Action, MoveAction, NoAction } from "./actions"
import { Actor } from "../modules/actors/actors"
import { Vector2D } from "@engine/utils/vectors"
import { PlayerAI } from "./player"

export class AI extends Component {

    constructor() { super();}
    public  initialize(): void {}
    public  update(_delta: number): void {}
    public  perform(_entity: Actor): Action | null { return new NoAction() }
}

export class Active extends Component {}

const RandomNumber = (min: number, max: number) => Math.round(Math.random() * (max - min) + min)

export class RandomMovementAI extends AI {

    constructor(public parent: Actor) { super() }
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

export function selectAI(entity: Actor,aiType: "player" | "random"): AI {
    switch (aiType) {
        case "player": return new PlayerAI(entity)
        case "random": return new RandomMovementAI(entity)
        default: return new RandomMovementAI(entity)
    }
        
}