import { Vector2D } from "@engine/utils"
import { Grid, Cell } from "./grid"

export class RegionCell extends Cell {
  region: Region<RegionCell> | null = null
}

export class Region<T extends RegionCell> {
  public grid: Grid<T> | null = null
  private cells: Set<T> = new Set()
  constructor(grid?: Grid<T> | null) { this.grid = grid || null}
  addCell(cell: T) {
    if (cell.region && cell.region !== this) {
      cell.region.removeCell(cell)
    }
    cell.region = this
    this.cells.add(cell)
  }
  getCells() { return this.cells }
  hasCell(cell: T) { return this.cells.has(cell) }
  removeCell(cell: T) { this.cells.delete(cell) }  
  clear() { this.cells.clear() }
    clone() { return new Region(this.grid) }

}

export class RegionRect<T extends RegionCell> extends Region<T> {
  _pos: Vector2D | undefined
  _dimensions: Vector2D | undefined

  public get position() {
    if (!this._pos) this._pos = new Vector2D(this.x, this.y)
    return this._pos
  }
  public get dimensions() { 
    if (!this._dimensions) this._dimensions = new Vector2D(this.width, this.height)
    return this._dimensions
  }

  public get area() {
    return this.width * this.height
  }

  constructor(grid?: Grid<T> | null, public x: number = 0, public y: number = 0, public width: number = 0, public height: number = 0) { super(grid) }

  getBorders(): T[] {
        const borderCells: T[] = []
        for (const cell of this.getCells().values()) {
            if (cell.x === this.x || cell.x === this.x + this.width - 1 || cell.y === this.y || cell.y === this.y + this.height - 1) {
                borderCells.push(cell)
            }
        }

        return borderCells
    }

   doesNotOverlap(regions: RegionRect<T>[]) {
        for (let r of regions) {
            if (this.x < r.x + r.width && this.x + this.width > r.x && this.y < r.y + r.height && this.y + this.height > r.y) {
                return false;
            }
        }
        return true
    }
}