export class SpriteAppearance {
  type = "sprite"
  resource: string
  sprite: string

  constructor(resource: string, sprite: string) {
    this.resource = resource
    this.sprite = sprite
  }
}

export class CircleAppearance {
  type = "circle"
  radius: number

  constructor(radius: number) {
    this.radius = radius
  }
}

export class RectAppearance {
  type = "rect"
  width: number
  height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }
}