import { App } from '@engine/app.base'
import { Engine } from '@engine/engine'
import { useGraphicsRenderSystem } from '@engine/render/system'

export class TinyQuest extends App {
    constructor(private type: "graphics" = "graphics", private elem: string = "tinyQuest",  private resolution: { width: number, height: number } = { width: 1120, height: 640 }) {
        super()
    }

    public start() {
        const renderSystem = useGraphicsRenderSystem({
            type: this.type,
            elem: this.elem,
            resolution: this.resolution
        })
        const engine = new Engine(renderSystem)
        engine.start()
    }
}

function main() {
    const game = new TinyQuest()

    game.start()
}

window.onload = () => {
  main()
}