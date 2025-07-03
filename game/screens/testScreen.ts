import { InputHandler } from "@/apps/handler.base";
import { GameInputHandler } from "@/apps/screens/gameScreen/game.handler";
import { Engine } from "@engine/engine";
import { ViewportSimple } from "@engine/render";
import { BaseScreen } from "@engine/screen.base";
import { GameMap } from "@modules/map/map.ts";
import { generateMap } from "@modules/map/utils";

export class TestScreen extends BaseScreen {
    private handler: InputHandler = new GameInputHandler()
    private map: GameMap | null = null
    private loading: boolean = false

    constructor() {
        super()
    }
    public update(delta: number) {
        return this
    }

    public initialize(engine: Engine): BaseScreen {
        engine.viewport.layers.clear()
        this.loadMap()
        return this
    }

    public async loadMap() {
        if (this.loading) return
        this.loading = true
        const response = await fetch("data/maps/test ver2.json")
        
        const mapDataTwo = await response.json()
        this.loading = false
        this.map = await generateMap(mapDataTwo)
        console.info(this.map)
    }

    render(viewport: ViewportSimple) {
      
    }
}