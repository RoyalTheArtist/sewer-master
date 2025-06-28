import { Appearance, TileObject } from "./tile.base"

import { Component } from "@engine/ecs"
import { AssetManager } from "@engine/assets"

import { SurfaceLayer } from "@engine/render"
import { Vector2D } from "@engine/utils"
import { RenderComponent } from "@engine/graphics"


export class TileDrawComponent implements Component {
  public parent: TileObject

  constructor(parent: TileObject) { this.parent = parent }
  update() {
    this.Draw()
  }
  
  initialize() {
    this.Draw()
  }

  private Draw(): void {
    //const color = this.parent..color
    //SurfaceLayer.background.drawStrokeRect(new Vector2D(this.parent.position.x * TILE_SIZE, this.parent.position.y * TILE_SIZE), new Vector2D(TILE_SIZE, TILE_SIZE), Color.fromString(color || 'white'))
  }
}

export class TileAppearance extends RenderComponent {
  public parent: TileObject | null = null
  private appearance: Appearance

  constructor(appearance: Appearance, public readonly dimensions: Vector2D) {
    super()
    this.appearance = appearance
  }

  public get start() {
    if (!this.parent) return new Vector2D(0, 0)
    return new Vector2D(this.parent.position.x * this.dimensions.x, this.parent.position.y * this.dimensions.y)
  }

  public get center() {
    return new Vector2D(this.start.x + this.dimensions.x / 2, this.start.y + this.dimensions.y / 2)
  }

  initialize() {  }

  update() { 
    this.draw()
  }

  draw() {
    const spritesheet = AssetManager.getSpriteSheet(this.appearance.resource)
    if (!spritesheet) return
    const sprite = spritesheet.getSprite(this.appearance.sprite)
    if (!sprite.img) return
    SurfaceLayer.background.surface.draw(sprite.img, this.start)
  }
}

export class TileBitmask implements Component {
  public parent: TileObject | null = null
  public value: number

  constructor(bitmask: number) {
    this.value = bitmask
  }
  initialize() {  }

  update() { }
}