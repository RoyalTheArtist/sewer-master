import { NoAction } from "@modules/actors";
import { StandardGameInput } from "@engine/input";
import { InputHandler } from "@/handler.base";

export class MainMenuInputHandler extends InputHandler {
    handleInput(_input: StandardGameInput) {
        return new NoAction()
    }
}
