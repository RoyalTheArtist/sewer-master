import { Action } from "../actions/moveActions"
import { StandardGameInput } from "@engine/input"

export abstract class InputHandler {
    abstract handleInput(input: StandardGameInput): Action | null
}