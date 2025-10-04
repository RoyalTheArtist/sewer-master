import { Action } from "./actions/action"
import { BumpAction } from "./actions/moveActions"
import { Settings } from "@/settings"
import { StandardGameInput } from "@engine/input"
import { InputManager } from "@engine/input/inputManager"
import { Vector2D } from "@engine/utils"
import { Timer } from "./utils"


export abstract class InputHandler {
    constructor(readonly input: InputManager) {}
    abstract handleInput(): Action | null
}

const getPlayerAction = (pressedActions: Set<string>) => {
    if (pressedActions.has("move_up")) {
        return new BumpAction(new Vector2D(0, -1))
    }

    if (pressedActions.has("move_down")) {
        return new BumpAction(new Vector2D(0, 1))
    }

    if (pressedActions.has("move_left")) {
        return new BumpAction(new Vector2D(-1, 0))
    }

    if (pressedActions.has("move_right")) {
        return new BumpAction(new Vector2D(1, 0))
    }

    if (pressedActions.has("move_up_left")) {
        return new BumpAction(new Vector2D(-1, -1))
    }

    if (pressedActions.has("move_up_right")) {
        return new BumpAction(new Vector2D(1, -1))
    }

    if (pressedActions.has("move_down_left")) {
        return new BumpAction(new Vector2D(-1, 1))
    }

    if (pressedActions.has("move_down_right")) {
        return new BumpAction(new Vector2D(1, 1))
    }

    if (pressedActions.has('pickup_item')) {     
        //return new PickupAction(new Vector2D(Player.player.position.x, Player.player.position.y))
    }

    return null
}

export class TQGameInputHandler extends InputHandler { 
    nextHandler: InputHandler | null = null

    private timer = new Timer()

    init() {
        this.input.registerMap(Settings.keyboardMappings.gameScreen)
    }

    update(delta: number): void {
        this.timer.update(delta)
    }
    handleInput(): Action | null {
        if (this.timer.running) return null
       
        const input = this.input.getInputs()
        const pressedActions = new Set<string>()
        for (const [action, value] of input.actions) {
            if (value === "pressed") {
                pressedActions.add(action)
            }
        }

        const action = getPlayerAction(pressedActions)
        if (action) {
            this.timer.start(200)
            return action
        }
       
        if (input.actions.has("open_inventory") && input.actions.get("open_inventory") === "pressed") {
            console.log("open inventory")
        }

        return null
    }   
}
