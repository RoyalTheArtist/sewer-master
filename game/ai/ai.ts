import { Component } from "@engine/ecs"
import { Action, MeleeAction, MoveAction, NoAction } from "../actions"
import { Actor } from "../../modules/actors/actors"
import { Vector2D } from "@engine/utils/vectors"
import { PlayerAI, Player } from "../player"
import { Pathfinding } from "./pathfinding"

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

export function selectAI(entity: Actor,aiType: "player" | "random" | "hostilePlayer"): AI {
    switch (aiType) {
        case "player": return new PlayerAI(entity)
        case "random": return new RandomMovementAI(entity)
        case "hostilePlayer": return new PlayerAttackAI(entity, new Pathfinding(entity))
        default: return new RandomMovementAI(entity)
    }
        
}

/* PlayerAttackAI this AI will move to and attack the player */
export class PlayerAttackAI extends AI {
    path: Vector2D[] = []

    constructor(public parent: Actor, public pathfinding?: Pathfinding) {
        super()
    }
    public initialize(): void {
    }
    public update(_delta: number): void {
        if (!Player.player) return
        this.path =this.pathfinding?.findPath(this.parent.position, Player.player.position) || []
    }
    public perform(entity: Actor): Action {
        const player = Player.player
        if (!player) return new NoAction()
        
        if (this.path.length === 1) return new MeleeAction(this.path[0])
        if (this.path.length === 0) return new NoAction()
        const destination = this.path[0]
        const direction = new Vector2D(destination.x - entity.position.x, destination.y - entity.position.y)
        const action = new MoveAction(direction)
        action.requester = entity
        return action
    }
}
