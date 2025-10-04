import { Action, NoAction } from "./actions/action"
import { ECS, Entity } from "./ecs"
import { AI, Appearance, Position } from "./components"
import { MakeActive } from './systems/combat/components'

export class PlayerAI extends AI {
    public nextTurn: Action | null = null
    constructor(parent: Entity) { super(parent) } 
    public initialize() { }
    public update(_delta: number) {
    }

    public setNextTurn(action: Action | null) {
        if (action) action.requester = this.entity
        this.nextTurn = action
    }
    public perform(): Action {
        if (!this.nextTurn) return new NoAction()
        const turn = this.nextTurn
        this.nextTurn = null
        return turn
    }
}

export class PlayerController {
    public player: Entity | null = null
    public playerAI: PlayerAI | null = null

    constructor(player?: Entity) {
        this.player = player || null
    }

    setPlayer(player: Entity) { this.player = player }
    setPlayerAI(ai: PlayerAI) { this.playerAI = ai }
    setNextTurn(action: Action | null) {
        this.playerAI?.setNextTurn(action)
    }
    spawnPlayer(ecs: ECS, x: number = 0, y: number = 0) {
        this.player = ecs.addEntity()
        ecs.addComponent(this.player, new Position(x, y))
        const playerAI = new PlayerAI(this.player)
        ecs.addComponent(this.player, playerAI)
        ecs.addComponent(this.player, new MakeActive())
        ecs.addComponent(this.player, new Appearance("adventurer"))
        this.playerAI = playerAI
        return this.player
    }
}
