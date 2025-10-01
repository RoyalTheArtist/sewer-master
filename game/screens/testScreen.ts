import { MapEntityViewer } from './../ui/mapTileViewer';
import { InputHandler } from "@/screens/inputHandler";
import { GameInputHandler } from "@/screens/game/game.handler";
import { Engine } from "@engine/engine";
import { BaseScreen } from "@engine/screen.base";
import { GameMap } from "@modules/map/map.ts";
import { generateMap } from "@modules/map/utils";
import { MapTileViewer } from "@/ui/mapTileViewer";
import { Player } from "@/player";
import { Vector2D } from "@engine/utils";
import { Actor } from "@modules/actors/actors";
import { Item } from "@modules/items";
import { GraphicsRenderSystem } from "@engine/render/system";
import { TurnSystem } from '@/systems/turnSystem';
import { CombatSystem } from '@modules/combat/fighter';
import { InputManager } from '@engine/input/inputManager';
import { Settings } from '@/settings';


const populateTestMap = (map: GameMap) => {
    const player = Player.spawnPlayerAt(new Vector2D(5, 5))
    player.parent = map

    const rat = Actor.spawnRat(new Vector2D(7, 7))
    rat.parent = map
    const rat2 = Actor.spawnHostileRat(new Vector2D(2, 2))
    rat2.parent = map

    const healingScroll = Item.makeScroll(new Vector2D(2, 5))
    map.addEntity(healingScroll)

    map.addEntity(player)
    map.addEntity(rat)
    map.addEntity(rat2)
}

const loadMap = async function() {
        const response = await fetch("data/maps/test ver2.json")
        const mapDataTwo = await response.json()
        
        const map = await generateMap(mapDataTwo)
        populateTestMap(map)

        console.info('Map Loaded: ', { map })
        return map
    }

const turnSystem = new TurnSystem()
const combatSystem = new CombatSystem()

export class TestScreen extends BaseScreen {
    private handler: InputHandler = new GameInputHandler()
    private _map: GameMap | null = null
    private tileViewer: MapTileViewer
    private entityViewer: MapEntityViewer

    constructor() {
        super()
        this.tileViewer = new MapTileViewer()
        this.entityViewer = new MapEntityViewer()
    }

    public get map(): GameMap | null {
        return this._map
    }

    public set map(map: GameMap) {
        this._map = map
    }

    async preload(): Promise<BaseScreen> {
        const map = await loadMap()
        
        if (this.tileViewer) this.tileViewer.setTiles(map.getTileMap())
        if (this.entityViewer) this.entityViewer.setEntities(map.getEntities())
        
        this.map = map
        this.ready = true
        return this
    }

    public initialize(engine: Engine) {
        engine.render.clear()
        
        if (engine.render instanceof GraphicsRenderSystem) {
            engine.render.addToTileLayer(this.tileViewer)
            engine.render.addToEntityLayer(this.entityViewer)
        }
       
        return this
    }

    public update(delta: number) {
        const inputs = InputManager.getInputs(Settings.keyboardMappings.gameScreen)
        this.handler.handleInput(inputs)

        turnSystem.query(this.map?.getEntities() || new Set())
        turnSystem.update(delta)
        return this
    }
}