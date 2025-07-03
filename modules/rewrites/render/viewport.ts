import type { Vector2D } from "@engine/utils"
import { Surface } from "./surface"
import type { SurfaceLayers } from "./surfaceLayers"

function provideElem(attachTo: string | HTMLElement) {
  if (typeof attachTo === "string") {
    const elem = document.getElementById(attachTo)
    if (elem !== null) return elem
    return document.body
  }
  return attachTo
}

export class Viewport {
  private surface: Surface | null = null
  resolution: Vector2D

  constructor(resolution: Vector2D, private _layers: SurfaceLayers) {
    this.resolution = resolution
  }

  public get layers(): SurfaceLayers {
    return this._layers
  }



  public initialize(attachTo?: string | HTMLElement) {
    const surface = Surface.makeSurface(this.resolution.x, this.resolution.y)
    this.surface = surface
    if (attachTo) {
      const elem = provideElem(attachTo)
      elem.appendChild(surface.canvas)
    }
  }

  public render() {
    if (!this.surface) return
    this.surface.clear()
    this._layers.render(this.surface)
    }
    
    public getSurface() {
    return this.surface
  }
}