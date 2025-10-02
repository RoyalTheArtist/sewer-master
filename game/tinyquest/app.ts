import { App } from "@engine/app.base"
import { Engine } from "@engine/engine"
import { useGraphicsRenderSystem } from "@engine/render/system"
import { ForestScreen, TModule } from "./screens/forestScreen"


export class TinyQuest extends App {
    constructor(private type: "graphics" = "graphics", private elem: string = "tinyQuest",  private resolution: { width: number, height: number } = { width: 1120, height: 640 }) {
        super()
    }

    public async start() {
        const render = useGraphicsRenderSystem({
            type: this.type,
            elem: this.elem,
            resolution: this.resolution
        })
        const engine = new Engine(render)
        engine.start()
        const moduleData = await engine!.resource.loadJson<TModule>('/data/modules/forest-module.json')
        const forestScreen = new ForestScreen(engine,moduleData)
        engine.setNextScreen(forestScreen)
    }
}