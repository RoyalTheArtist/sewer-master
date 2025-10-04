import { App } from "@engine/app.base"
import { Engine } from "@engine/engine"
import { RenderSystem, useGraphicsRenderSystem } from "@engine/render/system"
import { ForestScreen,TModule } from "./screens/forestScreen"
import { TQGameInputHandler } from "./handlers"


export class TinyQuest extends App {
    constructor(private render: RenderSystem) {
        super()
    }

    public async start() {
        const engine = new Engine(this.render)
        engine.start()
        const moduleData = await engine!.resource.loadJson<TModule>('/data/modules/forest-module.json')
        const handler = new TQGameInputHandler(engine.input)
        const forestScreen = new ForestScreen(handler,engine,moduleData)
        engine.setNextScreen(forestScreen)
    }
}