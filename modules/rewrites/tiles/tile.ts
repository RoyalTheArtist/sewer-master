
import { Entity } from "@engine/ecs"
import type { Appearance } from "../components"
import type { IInitialize } from "@engine/update.h"
import type { Surface } from "@engine/render/surface"
import { Vector2D } from "@engine/utils"
import { Sprite, SpriteSheet } from "@engine/render/graphics/sprite"

const BLANK_TILE: TileData = {
    name: 'blank',
    passable: true,
    transparent: true,
    appearance: undefined
}

export class Tile extends Entity {
    name: string
    passable: boolean
    transparent: boolean
    appearance: Appearance | undefined
    constructor(tile: TileData) {
        super()

        this.name = tile.name
        this.passable = tile.passable
        this.transparent = tile.transparent
        this.appearance = tile.appearance
    }
}

export class TileSet implements IInitialize{
  private _tiles: Map<number, Tile> = new Map()
  constructor(private _meta?: TilesetData) {
  }

  get tiles(): Tile[] {
    return Array.from(this._tiles.values())
  }

  initialize(): TileSet {
    if (!this._meta) return this
    for (const [idx, tile] of this._meta.tiles.entries()) {
      this._tiles.set(idx, new Tile(tile))
    }

    return this
  }

  generateTileLayout(layout: number[]): Tile[] {
    const tiles = []
    
    for (let i = 0; i < layout.length; i++) {
      const tile = this._tiles.get(layout[i])
      if (tile) {
        tiles.push(tile)
      } else {
        tiles.push(new Tile({ ...BLANK_TILE }))
      }
    }
    return tiles
  }
}

export interface TileData {
  name: string,
  passable: boolean,
  transparent: boolean,
  appearance: Appearance | undefined
}

export interface TilesetData {
  tiles: TileData[]
    // tilemap defines the relation between a tile's appearance and the graphical representation
  tilemap: {
    resource: string
    size: [width: number, height: number],
    atlas: Record<string, [x: number, y: number]>
  },
}

export class TileSprite extends Tile {
  position: Vector2D
  constructor(tile: Tile, public sprite: Sprite | null, position: Vector2D = new Vector2D(0, 0)) {
    super(tile)

    this.position = position
  }

  render(surface: Surface): void {
    if (this.sprite) {
      this.sprite.render(surface)
    }
  }
}

export interface BaseTileMap {
  tileset: TileSet
  spritesheet: SpriteSheet
  tiles: TileSprite[]

  getTileSprite(tile: Tile): TileSprite | undefined
  getMapSprites(layout: Tile[], width: number, height: number): TileSprite[]
}

export class TileMap implements BaseTileMap {
  tileset: TileSet
  spritesheet: SpriteSheet
  atlas: Map<string, [number, number]>
  size: [number, number]

  constructor(tileset: TileSet, spritesheet: SpriteSheet, data: { atlas: Record<string, [x: number, y: number]>, size: [number, number] }) {
    this.tileset = tileset
    this.spritesheet = spritesheet
   
    this.size = data.size

    this.atlas = new Map(Object.entries(data.atlas))
  }

  public get tiles(): TileSprite[] {
    return this.tileset.tiles.map((tile) => this.getTileSprite(tile)!)
  } 

  getTileSprite(tile: Tile): TileSprite | undefined {
    if (!tile.appearance) return new TileSprite(tile, null)
    
    const appearance = tile.appearance
    const dimensions = this.atlas.get(appearance.sprite)

    if (!dimensions) return undefined

    const start = new Vector2D(dimensions[0] * this.size[0], dimensions[1] * this.size[1])

    const sprite = this.spritesheet.getSprite(start, new Vector2D(this.size[0], this.size[1]))
    if (!sprite) return undefined

    return new TileSprite(tile, sprite.initialize())
  }

  getMapSprites(layout: Tile[], width: number, height: number): TileSprite[] {
    const sprites = []
    for (const [idx, tile] of layout.entries()) {
      const x = idx % width
      const y = Math.floor(idx / height)

      const position = new Vector2D(x * this.size[0], y * this.size[1])

      const sprite = this.getTileSprite(tile)
  
      if (!sprite) continue
        if (sprite.sprite) {
            sprite.sprite.position = position
      }
      sprite.position = position
      sprites.push(sprite)
    } 
  
    return sprites
  }
}

