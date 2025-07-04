
import { Vector2D } from "@engine/utils";
// import { Blank_Tile } from "@modules/map";
import type { Tile } from "@modules/tiles";
import { MouseHandler, useMouseHandler, type MouseState, type Position } from "@engine/input/mouse"
import type { GameMap } from "@modules/map/map";
import type { TileSprite } from "@modules/rewrites/tiles/tile";
import { Surface, type IRenderable } from "@engine/render/surface";
import { SurfaceLayers } from "@engine/render/surfaceLayers";
import {  ViewportSimple as Viewport } from "@engine/render/viewport";


class GridElement implements IRenderable {
  dimensions: Vector2D
  size: Vector2D
  private _grid: HTMLCanvasElement | undefined

  constructor(size: Vector2D, dimensions: Vector2D) {
    this.dimensions = dimensions
    this.size = size
  }
  render(surface: Surface) {
    if (!this._grid) this._grid = drawGrid(this.dimensions.x, this.dimensions.y, this.size.x, this.size.y)

    surface.drawAlpha(this._grid, new Vector2D(0, 0), 1, 0.5)
  }
}

class MapTileViewer implements IRenderable {
  constructor(private tiles: TileSprite[]) { }
  render(surface: Surface) {
    this.tiles.forEach((tile) => tile.render(surface))
    return surface
  }
}

export class MapViewScreen {
  private _lastUpdate: number = 0
  private _activeTile: Tile | null = null
  private mouse: MouseHandler

  constructor(public screen: Viewport, public map: GameMap) {
    this.mouse = useMouseHandler()
  }
  update(_: number) {
    this.screen.render()

    window.requestAnimationFrame((timeStamp) => {
      const delta = timeStamp - this._lastUpdate
      this._lastUpdate = timeStamp
      this.update(delta)
    })
    return this
  }

  private handleMouseDown(state: MouseState) {
    if (!this.activeTile) return

    const lockedPos = getlockedPos(this.mouse.mousePos, 16)

    // if (state.rightMouse) {
    //     this.map.tiles.setTile(lockedPos, { ...Blank_Tile})
    // } else {
    //     this.map.tiles.setTile(lockedPos, this.activeTile)
    // }
  }

  public setActiveTile(tile: Tile | null) {
    this._activeTile = tile
  }

  public get activeTile(): Tile | null {
    return this._activeTile
  }

  public setMap(map: GameMap) {
    this.map = map
    this.screen.layers.uiLayer.elements.clear()
    this.screen.layers.tileLayer.elements.clear()

    const gridElement = new GridElement(new Vector2D(16, 16), new Vector2D(map.width, map.height))
    this.screen.layers.uiLayer.elements.add(gridElement)

    const mapViewer = new MapTileViewer(map.getTileMap())
    this.screen.layers.tileLayer.elements.add(mapViewer)
  }

  public initialize(elem?: HTMLElement) {
    if (elem) {
      this.screen.attachTo(elem)
    }

    const surface = this.screen.getSurface()

    if (surface) {
      this.mouse.init(surface.canvas)
      this.mouse.onMouseDown((state) => {
      this.handleMouseDown(state)
    })
    }
  }

  public start() {

    this.update(0)
  }
}

function drawGrid(width: number, height: number, tileWidth: number, tileHeight: number): HTMLCanvasElement {
    const surface = Surface.makeSurface(width * tileWidth, height * tileHeight)
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

// function drawMap(map: GameMap): HTMLCanvasElement {
//   const tileWidth = 16
//   const tileHeight = 16

//   const surface = makeSurface(map.width * tileWidth, map.height * tileHeight)

//   map.tiles.tiles.forEach((tile, index) => {
//     if (!tile.sprite) return

//     const tileImage = tile.sprite
//     if(!tileImage) return
//     const x = (index % map.width) * tileWidth
//     const y = Math.floor(index / map.width) * tileHeight
//     surface.draw(tileImage, new Vector2D(x, y))
//   })

//   return surface.canvas
// }


// function drawMouse(position: Position, screen: Viewport) {
//   screen.surface.context.strokeStyle = 'red'
//   screen.surface.context.strokeRect(position.x, position.y, 16, 16)
// }


// const drawMouseCoords = (coords: Position, screen: Viewport) => {
//   const height = screen.surface.canvas.height

//   screen.surface.drawText(`${coords.x}, ${coords.y}`, new Vector2D(16, height - 20), new Color(255, 255, 255), 16)
// }

function getlockedPos(pos: Position, factor: number): Position {
    return {
        x: Math.floor((pos.x + 3) / factor),
        y: Math.floor((pos.y + 3) / factor)
    }
}

export function useMapView(width: number, height: number, map: GameMap) {
  const resolution = new Vector2D(width, height)
  const layers = new SurfaceLayers(resolution)
  const screen = new Viewport(resolution, layers)
  return new MapViewScreen(screen, map)
}
