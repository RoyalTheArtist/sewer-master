import { Cell } from "./cell"
import { Grid } from "./grid"

export class Region<T> {
  public grid: Grid<T> | null = null
  private cells: Set<Cell<T>> = new Set()
  constructor(grid?: Grid<T> | null) { this.grid = grid || null}
  addCell(cell: Cell<T>) {
    if (cell.region) {
      cell.region.removeCell(cell)
    }
    cell.region = this
    this.cells.add(cell)
  }
  getCells() { return this.cells }
  hasCell(cell: Cell<T>) { return this.cells.has(cell) }
  removeCell(cell: Cell<T>) { this.cells.delete(cell) }  
  clear() { this.cells.clear() }
    clone() { return new Region(this.grid) }

}

class Room<T> extends Region<T> {

}