import { makeSurface,  type Viewport } from "@engine/render";
import { Color, Vector2D } from "@engine/utils";
import { Blank_Tile, type GameMap } from "@modules/map";
import type { Tile } from "@modules/tiles";
import { MouseHandler, useMouseHandler, type MouseState, type Position } from "@engine/input/mouse"


export class MapViewScreen {
  private _lastUpdate: number = 0
  private _activeTile: Tile | null = null
  private mouse: MouseHandler
  update(_: number) {

    this.render()
    return this
  }

  private handleMouseDown(state: MouseState) {
    if (!this.activeTile) return

    const lockedPos = getlockedPos(this.mouse.mousePos, 16)

    if (state.rightMouse) {
        this.map.tiles.setTile(lockedPos, { ...Blank_Tile})
    } else {
        this.map.tiles.setTile(lockedPos, this.activeTile)
    }
  }

  public set activeTile(tile: Tile) {
    this._activeTile = tile
  }

  public get activeTile(): Tile | null {
    return this._activeTile
  }

  public render() {
    this.screen.clear()

    const grid = drawGrid(this.map.width, this.map.height, 16, 16)
    this.screen.drawAlpha(grid, 0, 0, 1, 0.5)

    if (this.map.tiles) {
        const map = drawMap(this.map)
        this.screen.drawAlpha(map, 0, 0, 1, 0)
    }

    if (this.mouse.available) {
      const lockedCoords = getlockedPos(this.mouse.mousePos, 16)
      drawMouse(new Vector2D(lockedCoords.x * 16, lockedCoords.y * 16), this.screen)
      drawMouseCoords(lockedCoords, this.screen)
    }


    window.requestAnimationFrame((timeStamp) => {
      const delta = timeStamp - this._lastUpdate
      this._lastUpdate = timeStamp
      this.update(delta)
    })
  }


  public start() {
    this.mouse.init(this.screen.surface.canvas)
    this.mouse.onMouseDown((state) => {
      this.handleMouseDown(state)
    })
    this.render()
  }

  constructor(public screen: Viewport, public map: GameMap) {
    this.mouse = useMouseHandler()
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

function drawMap(map: GameMap): HTMLCanvasElement {
  const tileWidth = 16
  const tileHeight = 16

  const surface = makeSurface(map.width * tileWidth, map.height * tileHeight)

  map.tiles.tiles.forEach((tile, index) => {
    if (!tile.sprite) return

    const tileImage = tile.sprite
    if(!tileImage) return
    const x = (index % map.width) * tileWidth
    const y = Math.floor(index / map.width) * tileHeight
    surface.draw(tileImage, new Vector2D(x, y))
  })

  return surface.canvas
}


function drawMouse(position: Position, screen: Viewport) {
  screen.surface.context.strokeStyle = 'red'
  screen.surface.context.strokeRect(position.x, position.y, 16, 16)
}


const drawMouseCoords = (coords: Position, screen: Viewport) => {
  const height = screen.surface.canvas.height

  screen.surface.drawText(`${coords.x}, ${coords.y}`, new Vector2D(16, height - 20), new Color(255, 255, 255), 16)
}

function getlockedPos(pos: Position, factor: number): Position {
    return {
        x: Math.floor((pos.x + 3) / factor),
        y: Math.floor((pos.y + 3) / factor)
    }
}
