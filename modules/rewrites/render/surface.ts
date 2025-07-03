import { Color, type Vector2D } from "@engine/utils"

export interface IRenderable {
  render(surface: Surface): void
}

export class Surface {
  private _canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement, public width: number, public height: number) {
     this._canvas = canvas
     this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  }

  public get canvas(): HTMLCanvasElement {
    return this._canvas
  }

  public get context(): CanvasRenderingContext2D {
    return this.ctx
  }

  public static makeSurface(width: number, height: number) {
    const canvas = document.createElement("canvas")
    return new Surface(canvas, width, height).initialize()
  }

  public initialize() {
    this.canvas.width = this.width
    this.canvas.height = this.height
    return this
  }

  public clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
    return this
  }

  public draw(image: HTMLImageElement | HTMLCanvasElement, position: Vector2D) {
    this.ctx.drawImage(image, position.x, position.y)
    return this
  }

  public drawAlpha(image: HTMLImageElement | HTMLCanvasElement, position: Vector2D, zoom: number, alpha: number) {
    this.ctx.save()
    this.ctx.globalAlpha = alpha
    const x = position.x
    const y = position.y
    this.ctx.drawImage(image, x, y, image.width * zoom, image.height * zoom)
    this.ctx.restore()
    return this
  }

  public drawRect(position: Vector2D, dimensions: Vector2D, color: Color = new Color(0, 0, 0)) {
    this.ctx.fillStyle = color.asString()
    this.ctx.fillRect(position.x, position.y, dimensions.x, dimensions.y)
    return this
  }

  public drawCircle(position: Vector2D, radius: number, color: Color = new Color(0, 0, 0)) {
    this.ctx.beginPath()
    this.ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI)
    this.ctx.fillStyle = color.asString()
    this.ctx.fill()
    return this
  }
}

export class GraphicsLayer {
  public readonly surface: Surface
  public elements: Set<IRenderable> = new Set()
  //objects: Map<any, any> = new Map()

  constructor(surface: Surface) {
    this.surface = surface
  }

  render(surface: Surface) {
    this.elements.forEach((element) => element.render(surface))
  }
}