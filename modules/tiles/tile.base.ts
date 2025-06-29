import { TileAppearance } from "./tile.components"

import { Entity } from "@engine/ecs"
import { Sprite } from "@engine/graphics"
import { IInitialize } from "@engine/update.h"
import { Vector2D } from "@engine/utils"

export class TileObject extends Entity implements IInitialize, Tile {
    public passable: boolean
    public transparent: boolean
    private _tile: Tile
    private _sprite: HTMLImageElement | undefined

    get sprite(): HTMLImageElement | undefined {
      return this._sprite
    }
  
    get appearance(): Appearance | undefined {
      return this._tile.appearance
    }
  
    constructor(public position: Vector2D,  tile: Tile, sprite?: HTMLImageElement | undefined) {
      super()

      this.passable = tile.passable
      this.transparent = tile.transparent

      this._tile = tile
      this._sprite = sprite
    }
  
    public initialize(): TileObject {
      //this.addComponent(new TileDrawComponent())
      
      if (this._tile.appearance) {
        const appearance = new TileAppearance(
          this._tile.appearance,
          new Vector2D(16, 16))
        this.addComponent(appearance)
      }
      return this
  }
}
  
export type Appearance = {
  resource: string
  sprite: string
  color?: string
}

  
export type Tile = {
    passable: boolean
    transparent: boolean
    appearance?: Appearance
}