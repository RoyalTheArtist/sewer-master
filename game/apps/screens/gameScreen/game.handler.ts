import { Action, BumpAction } from "../../../actions"
import { StandardGameInput } from "@engine/input"
import { Vector2D } from "@engine/utils"

import { InputHandler } from "@/apps/handler.base"
import { Player } from "@/apps/player"
import { PickupAction } from "@game/actions/pickupActions"

export class GameInputHandler extends InputHandler { 
    handleInput(input: StandardGameInput): Action | null {
        // if (input.axis.discrete.x !== 0 || input.axis.discrete.y !== 0) {

        //     Player.setNextTurn(new MoveAction(new Vector2D(input.axis.discrete.x, input.axis.discrete.y)))
        // }

        // I'm sure there's a better way to do this
        if (input.actions.get("move_up") === "pressed") {
            Player.setNextTurn(new BumpAction(new Vector2D(0, -1)))
        }

        if (input.actions.get("move_down") === "pressed") {
            Player.setNextTurn(new BumpAction(new Vector2D(0, 1)))
        }

        if (input.actions.get("move_left") === "pressed") {
            Player.setNextTurn(new BumpAction(new Vector2D(-1, 0)))
        }

        if (input.actions.get("move_right") === "pressed") {
            Player.setNextTurn(new BumpAction(new Vector2D(1, 0)))
        }

        if (input.actions.get("move_up_left") === "pressed") {
            Player.setNextTurn(new BumpAction(new Vector2D(-1, -1)))
        }

        if (input.actions.get("move_up_right") === "pressed") {
            Player.setNextTurn(new BumpAction(new Vector2D(1, -1)))
        }

        if (input.actions.get("move_down_left") === "pressed") {
            Player.setNextTurn(new BumpAction(new Vector2D(-1, 1)))
        }

        if (input.actions.get("move_down_right") === "pressed") {
            Player.setNextTurn(new BumpAction(new Vector2D(1, 1)))
        }

        if (input.actions.has("open_inventory") && input.actions.get("open_inventory") === "pressed") {
            console.log("open inventory")
        }

        if (input.actions.get('pickup_item') === "pressed") {
            if (!Player.player) return null
            Player.setNextTurn(new PickupAction(new Vector2D(Player.player.position.x, Player.player.position.y)))
        }

        return null
    }   
}