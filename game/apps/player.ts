import { Actor } from "@modules/actors"
import { Action, NoAction } from '../actions'
import { Vector2D } from "@engine/utils"
import { Position } from "@modules/components"
import { ActorAppearance } from "@modules/actors/actors.components"
import { Fighter } from "@modules/combat/fighter"
import { BlocksMovement } from "@/lib/components"
import { AI } from "../ai"

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

    public initialize() { }
    public update(_delta: number) {
    }
    public perform(): Action {
        if (Player.nextTurn) {
            const action = Player.nextTurn
            Player.setNextTurn(null)
            return action
        }
        return new NoAction()
    }
}

export const spawnPlayer = (position: Vector2D) => {
    const player = new Actor()
    player.name = "You"
    player.initialize()
    player.addComponent(new PlayerAI(player))
    player.addComponent(new ActorAppearance({ shape: "circle", resource: "sewers", sprite: "adventurer" }))
    player.addComponent(new Position(position))
    player.addComponent(new Fighter(100))
    player.addComponent(new BlocksMovement)
    return player
}