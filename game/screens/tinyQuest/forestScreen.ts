import { BaseScreen } from "@engine/screen.base";
import { GameInputHandler } from "../game/game.handler";
import { TinyMap } from "@modules/generators/temporary";
import { InputManager } from "@engine/input/inputManager";
import { Settings } from "@/settings";
import { ViewportSimple } from "@engine/render/viewport";
import { ForestMapGenerator } from "@modules/generators/mapGenerator";

export class ForestScreen extends BaseScreen {
  private _handler: GameInputHandler = new GameInputHandler()
    private _map: TinyMap | undefined
    public get map(): TinyMap | undefined {
        return this._map
    }

    public initialize() {
        const forestGenerator = new ForestMapGenerator(100, 100)
        forestGenerator.generate()
        this._map = forestGenerator.map

        return this
    }

    update(delta: number) {
        const inputs = InputManager.getInputs(Settings.keyboardMappings.gameScreen)
        this._handler.handleInput(inputs)
    
        //const allEntities = new Set([...this.map.entities, ...this.map.tiles.tiles])

        //this.map.update(delta) 
        // ActionQueue.processActions(delta)
        // renderSystem.query(allEntities)
        // renderSystem.update(delta)
        // renderSystem.draw()
       
        return this
    }

    render(viewport: ViewportSimple): void {
        
    }
}