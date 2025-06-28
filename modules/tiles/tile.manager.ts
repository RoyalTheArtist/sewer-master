
import { Vector2D } from "@engine/utils"
import { TileObject, Tile } from "./tile.base"
import { calculateBitmask } from "./tiles.utils"



export class TileManager {
    private _tiles: TileObject[]
  
    constructor(public readonly dimensions: Vector2D) {
      this._tiles = new Array(this.size)
    }
  
    public get size(): number {
      return this.dimensions.x * this.dimensions.y
    }

    public get width(): number {
      return this.dimensions.x
    }
  
    public get height(): number {
      return this.dimensions.y
    }
  
    public get tiles(): TileObject[] {
      return this._tiles
    }
  
    public initialize() {
      for (const tile of this._tiles) {
        tile.initialize()
        }
        this.process()
    }

    public process() {
      calculateBitmask(this)
    }
  
    public update(delta: number) {
      for (const tile of this._tiles) {
        tile.update(delta)
      }
    }
  
    public getTile(position: Vector2D) {
      return this._tiles[position.y * this.dimensions.x + position.x]
    }
  
    public setTile(position: Vector2D, tile: Tile) {
        this._tiles[position.y * this.dimensions.x + position.x] = new TileObject(new Vector2D(position.x, position.y), { ...tile})
    }
  
    public setTiles(tiles: TileObject[]) {
        this._tiles = tiles
    }
  
    public getTilesInBounds(position: Vector2D, dimensions: Vector2D) {
      const { x: width, y: height } = dimensions
  
      const tiles = new Array(width * height)
      for (let i = 0; i < width * height; i++) {
        const x = position.x + i % width
        const y = position.y +Math.floor(i / width)
          const tile = this.getTile(new Vector2D(x, y))
          if (tile) {
              tiles.push(tile)
          } 
      }
      return tiles
    }
  }