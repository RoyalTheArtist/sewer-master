import { useRenderSystem } from '@engine/render/system'
import { TinyQuest } from './tinyquest/app'

const RENDER_SETTINGS = {
  type: "canvasgraphics",
  elem: "tinyQuest",
  resolution: {
    width: 1120,
    height: 640
  }
} as const

function main() {
  const { render, viewport } = useRenderSystem({
                type: RENDER_SETTINGS.type,
                resolution: RENDER_SETTINGS.resolution
  })
  viewport.attachTo(RENDER_SETTINGS.elem)
    const game = new TinyQuest(render)

    game.start()
}

window.onload = () => {
  main()
}