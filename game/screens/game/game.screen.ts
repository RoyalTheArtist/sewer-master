



import { GameInputHandler } from "./game.handler"

import { BaseScreen } from "@engine/screen.base"
import { Vector2D } from "@engine/utils"
import { InputManager } from "@engine/input"

import { Player } from '@/player'
import { Settings } from "@/settings"
import { GameMapOld as GameMap } from "@modules/map"
import { Actor } from "@modules/actors"
import { SurfaceLayer, ViewportSimple } from "@engine/render"
import { Item } from "@modules/items/items.base"

// 1 = wall

export class GameScreen extends BaseScreen  {
    private _handler: GameInputHandler = new GameInputHandler()
    private _map: GameMap

    constructor(map: GameMap) {
        super()
        this._map = map
    }
    public get map(): GameMap {
        return this._map
    }

    public initialize(): GameScreen {

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