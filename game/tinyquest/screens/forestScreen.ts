import { BaseScreen } from "@engine/screen.base";

import { ForestGenerator } from "@modules/generators/mapMakers/forest";
import { TTile } from "../tiles";
import { TinyMap } from "../tinyMap";
import { AppearanceData, WorldViewer,  } from "../graphics";
import { PlayerController } from "../player";
import { ECS } from "../ecs";
import { TQGameInputHandler } from "../handlers";
import { Engine } from "@engine/engine";
import { World } from "../components";
import { CombatSystem, WakeupSystem } from "../systems/combat/system";
import { MovementSystem } from "../systems/movement";


export type TModule = {
    meta: {}
    resources: string[]
    appearances: Record<string, AppearanceData>
    tiles: TTile[]
}


// class AppearanceAtlas {
//     library: Map<string, Appearance>
// }

class GameAtlas {

}

export class ForestScreen extends BaseScreen {
    map: TinyMap | undefined
    ecs: ECS
    private player: PlayerController
    private combatSystem = new CombatSystem()
    private worldViewer: WorldViewer
    atlas = new GameAtlas()

    constructor(private handler: TQGameInputHandler, engine: Engine, public module: TModule) {
        super()
        this.ecs = new ECS()

        this.player = new PlayerController()
        this.worldViewer = new WorldViewer(engine.resource, engine.render.viewport)
    }

    public async preload() {
        
        this.worldViewer.addAppearanceData(this.module.appearances)
        this.ready = true
        return this
    }

    public initialize() {
        const generator = new ForestGenerator(70, 40)
        generator.createTileset(this.module.tiles)
        const map = generator.generate().bake()
        this.map = map
        
        this.worldViewer.addTiles(this.map.tiles.cellsFlat)
        const startingTile = generator.startingTile

        if (startingTile) {
            const player = this.player.spawnPlayer(this.ecs, startingTile.x, startingTile.y)
            this.ecs.addComponent(player, new World(map))
        }
       
        this.handler.init()
        
        this.ecs.addSystem(new WakeupSystem(this.combatSystem))
        this.ecs.addSystem(this.combatSystem)
        this.ecs.addSystem(new MovementSystem())
        this.ecs.addSystem(this.worldViewer)
        return this
    }

    public loadModule(module: TModule) {
        this.module = module
    }

    update(delta: number) {
        this.handler.update(delta)
        const action = this.handler.handleInput()
        if (action) {
            this.player.setNextTurn(action)
        }
        this.ecs.update()
        return this
    }

    render(): void {
        this.worldViewer.render()
    }
}