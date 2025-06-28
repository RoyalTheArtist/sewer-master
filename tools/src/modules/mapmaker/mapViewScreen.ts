import { makeSurface, type Viewport } from "@engine/render";
import type { GameMap } from "@modules/map";

export class MapViewScreen {
  private _lastUpdate: number = 0
  update(_: number) {
    this.render()
    return this

  }

  public render() {
    this.screen.clear()

    const grid = drawGrid(this.map.width, this.map.height, 20, 20)
    this.screen.drawAlpha(grid, 0, 0, 1, 0.5)

    window.requestAnimationFrame((timeStamp) => {
            const delta = timeStamp - this._lastUpdate
            this._lastUpdate = timeStamp
            this.update(delta)
        })
  }

  public start() {
    this.render()
  }

  constructor(public screen: Viewport, public map: GameMap) {
  }
}

function drawGrid(width: number, height: number, tileWidth: number, tileHeight: number): HTMLCanvasElement {
    const surface = makeSurface(width * tileWidth, height * tileHeight)
    const ctx = surface.context
    ctx.strokeStyle = 'rgba(255,255,255)'

    for (let x = 0; x <= width * tileWidth; x += tileWidth) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height * tileHeight)
        ctx.stroke()
    }

    for (let y = 0; y <= tileHeight * height; y += tileHeight) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width * tileWidth, y)
        ctx.stroke()
    }

    return surface.canvas
}
