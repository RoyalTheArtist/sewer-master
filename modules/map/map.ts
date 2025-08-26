import type { Entity } from '@engine/ecs/entity'
import { Position } from '../components'
import type { Vector2D } from '@engine/utils'
import { Tile, TileMap, TileSprite, type TilesetData } from '@modules/tiles/tile'
import { Pathfinding } from '@/ai/pathfinding'

interface BaseMap {
  name: string,
  size: Vector2D,
  tiles: Tile[]

  setTile(index: number, tile: Tile): this
  setTiles(tiles: Tile[]): this
  getTileMap(): TileSprite[]
  getTile(x: number, y: number): Tile
  getTileAtPosition(position: Vector2D): Tile
  isInBounds(position: Vector2D): boolean
  isPassable(position: Vector2D): boolean
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

  public getTile(x: number, y: number) {
    return this.tiles[y * this.size.x + x]
  }

  public getTileAtPosition(position: Vector2D) {
    return this.getTile(position.x, position.y)
  }

  findEntity(position: Vector2D) {
    for (const entity of this._entities) {
      const positionComponent = entity.getComponent<Position>(Position)
      if (positionComponent.position.x === position.x && positionComponent.position.y === position.y) {
        return entity
      }
    }
    return null
  }

  isWalkable(position: Vector2D) {
    const tile = this.getTile(position.x, position.y)
    if (tile) {
      return tile.passable
    } 
    return true
  }

  isInBounds(position: Vector2D) {
    return position.x >= 0 && position.x < this.width && position.y >= 0 && position.y < this.width
  }

  isPassable(position: Vector2D) {
    const tile = this.getTile(position.x, position.y)
    if (tile) {
      return tile.passable
    } 
    return true
  }

   entityBlocks(position: Vector2D) {
      const entity = this.findEntity(position)
      if (entity) return true
      return false
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