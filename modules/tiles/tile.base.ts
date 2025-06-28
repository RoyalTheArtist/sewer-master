import { TileAppearance } from "./tile.components"

import { Entity } from "@engine/ecs"
import { IInitialize } from "@engine/update.h"
import { Vector2D } from "@engine/utils"

export class TileObject extends Entity implements IInitialize, Tile {
    public passable: boolean
    public transparent: boolean
    private _tile: Tile

    constructor(public position: Vector2D,  tile: Tile) {
      super()

      this.passable = tile.passable
      this.transparent = tile.transparent

      this._tile = tile
    }
  
    public initialize(): void {
      //this.addComponent(new TileDrawComponent())
      
      if (this._tile.appearance) {
        const appearance = new TileAppearance(
          this._tile.appearance,
          new Vector2D(16, 16))
        this.addComponent(appearance)
      }
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