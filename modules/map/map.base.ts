import { Entity } from "@engine/ecs"
import { IInitialize } from "@engine/update.h"

import { Tile, TileManager, TileObject } from "@modules/tiles"
import { Vector2D } from "@engine/utils"
import { Actor } from "../actors/actors"
import { TurnSystem } from "../../game/systems/actors.systems"
import { Position, BlocksMovement } from "../components"
import { CombatSystem } from "../combat/fighter"
import { Item } from "../items/items.base"

export interface IMapData {
  width: number
  height: number
  tiles: Tile[]
}

interface BaseMap {
  width: number
  height: number
  tiles: Tile[]
}

const turnSystem = new TurnSystem()
const combatSystem = new CombatSystem()


export class GameMap extends Entity implements IInitialize {
  private _tileManager: TileManager
  private _entities: Set<Entity> = new Set()
  private _activeActors: Set<Actor> = new Set()
  
  public get entities(): Set<Entity> {
    return this._entities
  }

 constructor(public size: Vector2D, tileManager: TileManager) {
    super()
    this._tileManager = tileManager
  }

  public get width(): number {
    return this.size.x
  }

  public get height(): number { 
    return this.size.y
  }


  public get tiles(): TileObject[] {
    return this._tileManager.getAllTiles()
  }

  public initialize() {
    this._tileManager.initialize()
  }

  public update(delta: number) { 
    turnSystem.query(this._activeActors)
    combatSystem.query(this._entities)

    turnSystem.update(delta)
    combatSystem.update(delta)
  }

  addEntity(entity: Actor | Item) {
    entity.parent = this
    this._entities.add(entity)
  }

  addActor(entity: Actor) {
    entity.parent = this
    this._entities.add(entity)
    this._activeActors.add(entity)
  }
  
  removeEntity(entity: Entity) {
    this._entities.delete(entity)
    if (entity instanceof Actor) {
      this._activeActors.delete(entity)
    }
  }

  isWalkable(position: Vector2D) {
    const tile = this._tileManager.getTile(position)
    if (tile) {
      return tile.passable
    } 
    return true
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

  findEntities(position: Vector2D) {
    const entities: Entity[] = []
    for (const entity of this._entities) {
      const positionComponent = entity.getComponent<Position>(Position)
      if (positionComponent.position.x === position.x && positionComponent.position.y === position.y) {
        entities.push(entity)
      }
    }
    return entities
  }

  entityBlocks(position: Vector2D) {
    const entity = this.findEntity(position)
    if (entity) {
      return entity.hasComponent(BlocksMovement)
    }
    return null
  }

  isInBounds(position: Vector2D) {
    return position.x >= 0 && position.x < this.width && position.y >= 0 && position.y < this.width
  }

  public saveMap(): IMapData {
    return {
      width: this.width,
      height: this.height,
      tiles: this.tiles
    }
  }
}
 