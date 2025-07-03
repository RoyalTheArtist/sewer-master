



import { GameInputHandler } from "./game.handler"

import { BaseScreen } from "@engine/screen.base"
import { Vector2D } from "@engine/utils"
import { renderSystem } from "@engine/graphics"
import { InputManager } from "@engine/input"

import { Player } from '@/apps/player'
import { Settings } from "@/apps/settings"
import { GameMapOld as GameMap } from "@modules/map"
import { Actor } from "@modules/actors"
import { SurfaceLayer, ViewportSimple } from "@engine/render"
import { Item } from "@modules/items/items.base"
import { ActionQueue } from "@/actions"

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
        const player = Player.spawnPlayerAt(new Vector2D(5, 5))
        player.parent = this._map


        const rat = Actor.spawnRat(new Vector2D(7, 7))
        rat.parent = this._map

        const rat2 = Actor.spawnRat(new Vector2D(2, 2))
       
        const healingScroll = Item.makeScroll(new Vector2D(2, 5))
        this.map.addEntity(healingScroll)


        this.map.addActor(player)
        this.map.addActor(rat)
        this.map.addActor(rat2)

        SurfaceLayer.setZoom(3)

        return this
    }

    update(delta: number) {
        const inputs = InputManager.getInputs(Settings.keyboardMappings.gameScreen)
        this._handler.handleInput(inputs)
    
        //const allEntities = new Set([...this.map.entities, ...this.map.tiles.tiles])

        this.map.update(delta) 
        // ActionQueue.processActions(delta)
        // renderSystem.query(allEntities)
        // renderSystem.update(delta)
        // renderSystem.draw()
       
        return this
    }

    render(viewport: ViewportSimple): void {
        
    }
}