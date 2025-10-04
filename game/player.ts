import { Actor } from "@modules/actors/actors"
import { Action, NoAction } from './actions'
import { Vector2D } from "@engine/utils"
import { Position } from "@modules/components"
import { ActorAppearance } from "@modules/actors/components/appearance"
import { Fighter } from "@modules/combat/fighter"
import { BlocksMovement } from "@/lib/components"
import { Active, AI } from "./ai/ai"
import { Entity } from "@engine/ecs"

export class Player {
    private static _nextTurn: Action | null = null
    private static _player: Actor | null = null

    static get player(): Actor | null { return Player._player }

    static get nextTurn(): Action | null {
        return Player._nextTurn
    }
    static setNextTurn(action: Action | null) {
        if (action) {
            action.requester = Player._player as Actor
        }
        
        Player._nextTurn = action
    }

    static setPlayer(actor: Actor) {
        Player._player = actor
    }

    static spawnPlayerAt(position: Vector2D) {
        if (Player._player) {
            return Player._player
        }
        Player._player = spawnPlayer(position)
        Player._player.addComponent(new Position(position))
      
        return Player._player
    }
}


export class PlayerAI extends AI {
    constructor(public parent: Actor) { super() }
    public initialize() { }
    public update(_delta: number) {
    }
    public perform(): Action {
        if (Player.nextTurn) {
            const action = Player.nextTurn
            const canPerform = action.canPerform(this.parent)
            if (canPerform) {
                Player.setNextTurn(null)
                return action
            }
        }
        return new NoAction()
    }
}

export const spawnPlayer = (position: Vector2D) => {
    const player = new Actor()
    player.name = "You"
    player.initialize()
    player.addComponent(new PlayerAI(player))
    player.addComponent(new ActorAppearance("adventurer",{ 
            resource: "assets/images/dungeon_sewers_002.png",
            size: [16, 16]
         }, [1, 1]))
    player.addComponent(new Position(position))
    player.addComponent(new Fighter(100))
    player.addComponent(new BlocksMovement)
    player.addComponent(new Active())
    return player
}