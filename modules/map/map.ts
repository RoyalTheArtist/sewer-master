import type { Entity } from '@engine/ecs/entity'
import type { Vector2D } from '@engine/utils'
import { Tile, TileMap, TileSprite, type TilesetData } from '@modules/rewrites/tiles/tile'

interface BaseMap {
  name: string,
  size: Vector2D,
  tiles: Tile[]

  setTile(index: number, tile: Tile): BaseMap
  setTiles(tiles: Tile[]): BaseMap
  getTileMap(): TileSprite[]
}

export interface MapGenerationData {
  meta: {
    name: string,
    size: [width: number, height: number],
    spritesheet: string
  },
  terrain: {
    tileset: TilesetData,
    layout: number[]
  },
  entities: Array<Entity>
}

export interface MapLoadData {
  meta: {
    name: string,
    size: [width: number, height: number]
  },
  terrain: {
    tileset: TilesetData,
    layout: Tile[]
  },
  entities: Array<Entity>,
}

export class GameMap implements BaseMap {
  public name: string
  private _size: Vector2D
  private _tiles: Tile[]
  private tileMap: TileMap | undefined
  private _entities: Set<Entity>
  
  constructor(name: string, size: Vector2D, tileMap?: TileMap) {
    this.name = name
    this._size = size
    this._tiles = new Array(size.x * size.y)
    this.tileMap = tileMap
    this._entities = new Set()
  }
  
  public get size(): Vector2D {
      return this._size
  }

  public set size(size: Vector2D) {
    this._size = size
  }
  
  public get tiles(): Tile[] {
    return this._tiles
  }

  public set tiles(tiles: Tile[]) {
    this._tiles = tiles
  }

  public get width(): number {
    return this.size.x
  }
  
  public get height(): number {
    return this.size.y
  }
      
  public setTile(index: number, tile: Tile) {
    this.tiles[index] = tile
    return this
  }

  public setTiles(tiles: Tile[]) {
    this.tiles = tiles
    return this
  }
  
  public getTileMap(): TileSprite[] {
      if (!this.tileMap) return []
      return this.tileMap.getMapSprites(this.tiles, this.size.x, this.size.y)
  }

  public addEntity(entity: Entity) {
    this._entities.add(entity)
  }

  public getEntities(): Set<Entity> {
    return this._entities
  }
}