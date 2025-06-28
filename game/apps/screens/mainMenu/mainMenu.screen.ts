
import { GameScreen } from "../gameScreen"

import { InputManager } from "@engine/input"
import { SurfaceLayer } from "@engine/render"
import { BaseScreen } from "@engine/screen.base"
import { Color, Vector2D } from "@engine/utils"

import { Settings } from "@/apps/settings"
import { createMap } from "@modules/map"

const mapDataOne = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0
]
  
// const mapDataTwo = [
//     0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//     0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
//     0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
//     0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
//     0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
//     0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
//     0, 1, 0, 1, 1, 0, 1, 0, 1, 0,
//     0, 1, 0, 1, 0, 0, 1, 0, 1, 0,
//     0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
//     0, 0, 0, 0, 0, 0, 0, 0, 0, 0
//   ]

const mapDataThree = [
    1, 1, 0, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1
]

export class MainMenuScreen extends BaseScreen {
    initialize() {
        
    }
    update(_delta: number) {
        const inputs = InputManager.getInputs(Settings.keyboardMappings.mainMenu)
        if (inputs.actions.has("new_game") && inputs.actions.get("new_game") === "pressed") {
            const map = createMap(mapDataThree, 10, 10)
            return new GameScreen(map).initialize()
        }
        
        SurfaceLayer.background.clear()
        SurfaceLayer.foreground.clear()

        const white = new Color(255, 255, 255)

        SurfaceLayer.background.surface.drawText('Sewer Master', new Vector2D(400, 200), white, 32)
        SurfaceLayer.background.surface.drawText('(N) New Game', new Vector2D(400, 250), white, 16)
        SurfaceLayer.background.surface.drawText('(T) Test Chamber', new Vector2D(400, 275), white, 16)
        SurfaceLayer.background.surface.drawText('(Q) Quit', new Vector2D(400, 300), white, 16)
        
        return this
    }
}
