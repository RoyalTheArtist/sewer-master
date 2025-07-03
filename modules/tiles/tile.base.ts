import { TileAppearance } from "./tile.components"

import { Entity } from "@engine/ecs"
import { IInitialize } from "@engine/update.h"
import { Vector2D } from "@engine/utils"

export class TileObject extends Entity implements IInitialize, Tile {
    public passable: boolean;
    public transparent: boolean;
  
    public appearance: Appearance | undefined;
    private _sprite: HTMLImageElement | undefined

    get sprite(): HTMLImageElement | undefined {
      return this._sprite
    }
  
    constructor(public position: Vector2D,  tile: Tile, sprite?: HTMLImageElement | undefined) {
      super()

      this.passable = tile.passable
      this.transparent = tile.transparent
      this.appearance = tile.appearance
      
      this._sprite = sprite
    }
  
    public initialize(): TileObject {
      //this.addComponent(new TileDrawComponent())
      
      if (this.appearance) {
        const appearance = new TileAppearance(
          this.appearance,
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