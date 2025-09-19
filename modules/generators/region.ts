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