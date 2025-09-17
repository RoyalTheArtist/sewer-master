import { Surface } from "@engine/render/surface";
import { Vector2D } from "@engine/utils";
import { Color } from "@engine/utils/color";

// Walls cheat: [top, right, bottom, left]
export class Region {
  public grid: Grid | null = null
  private cells: Set<Cell> = new Set()
  constructor(grid?: Grid | null) { this.grid = grid || null}
  addCell(cell: Cell) {
    if (cell.region) {
      cell.region.removeCell(cell)
    }
    cell.region = this
    this.cells.add(cell)
  }
  getCells() { return this.cells }
  hasCell(cell: Cell) { return this.cells.has(cell) }
  removeCell(cell: Cell) { this.cells.delete(cell) }  
  clear() { this.cells.clear() }
  clone() { return new Region(this.grid) }
}

export class Cell {
  private x: number;
  private y: number;
  private walkable: boolean;
  private cost: number;
  private _color: Color
  public walls: [boolean, boolean, boolean, boolean] = [false, false, false, false];
  public region: Region | null = null
  public lookslike?: string

  public get color(): Color { return this._color }
  public set color(color: Color) {
    this._color = color
  }

  constructor(x: number, y: number, walkable: boolean = false, cost: number = 1, lookslike?: string) {
    this.x = x;
    this.y = y;
    this.walkable = walkable;
    this.cost = cost;
    this.color = Color.fromString("black")
    this.lookslike = lookslike
    }
    
    public get coordinates(): [number, number] {
    return [this.x, this.y];
    }

  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }

  public isWalkable(): boolean {
    return this.walkable;
  }

  public getCost(): number {
    return this.cost;
  }

  public setWalkable(walkable: boolean): void {
    this.walkable = walkable;
  }

  public setCost(cost: number): void {
    this.cost = cost;
  }

  public draw(surface: Surface, position: Vector2D) {
    surface.drawRect(position, new Vector2D(10, 10), this.color)
    return this
  }

  public drawWalls(surface: Surface, position: Vector2D) {
    if (this.walls[0]) {
      surface.drawRect(new Vector2D(position.x, position.y), new Vector2D(10, 1), Color.fromString("black"))
    }

    if (this.walls[1]) {
      surface.drawRect(new Vector2D(position.x + 9, position.y), new Vector2D(1, 10), Color.fromString("black"))
    }

    if (this.walls[2]) {
      surface.drawRect(new Vector2D(position.x, position.y + 9), new Vector2D(10, 1), Color.fromString("black"))
    }

    if (this.walls[3]) {
      surface.drawRect(new Vector2D(position.x, position.y), new Vector2D(1, 10), Color.fromString("black"))
    }
    return this
  }

  public breakWall(direction: number[]) {
    const [x, y] = direction

    if (x === 0) {
      if (y === 1) {
        this.walls[2] = false
      } else if (y === -1) {
        this.walls[0] = false
      }
    } else if (y === 0) {
      if (x === 1) {
        this.walls[1] = false
      } else if (x === -1) {
        this.walls[3] = false
    }
    }
  }
}

export class Grid {
  private width: number;
  private height: number;
  private cells: Cell[][];

  constructor(width: number, height: number) {
    this.width = width;
      this.height = height;
      
      this.cells = new Array(height).fill(0).map((_, y) => new Array(width).fill(0).map((_, x) => new Cell(x, y, false, 1)));
      
    // this.cells = new Array(height).fill(0).map(() => new Array(width).fill(0).map(() => new Cell(0, 0, true, 1)));
      
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public getCell(x: number, y: number): Cell | undefined {
    if (!this.isWithinBounds(x, y)) return undefined;
    return this.cells[y][x];
  }

  public setCell(x: number, y: number, cell: Cell): void {
    this.cells[y][x] = cell;
  }

  public isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public isWalkable(x: number, y: number): boolean {
    if (!this.getCell(x, y)) return false;
    return (this.getCell(x, y) as Cell).isWalkable();
    }
    
  public getBlockedCells(): Cell[] {
    const blockedCells: Cell[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.getCell(x, y).isWalkable()) {
          blockedCells.push(this.getCell(x, y));
        }
      }
    }
    return blockedCells;
  }

  public getAllCells(): Cell[] {
    const allCells: Cell[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        allCells.push(this.getCell(x, y) as Cell);
      }
    }
    return allCells;
  }

  public getNeighbors(x: number, y: number): Cell[] {
    const neighbors: Cell[] = [];
    for (const dx of [-1, 0, 1]) {
      for (const dy of [-1, 0, 1]) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (this.isWithinBounds(nx, ny)) {
          neighbors.push(this.getCell(nx, ny) as Cell);
        }
      }
    }
    return neighbors;
  }

  public resetGrid() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setCell(x, y, new Cell(x, y, false, 1));
      }
    }
  }

  public draw(surface: Surface, cellSize: number, drawWalls: boolean = true) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.getCell(x, y)?.draw(surface, new Vector2D(x * cellSize, y * cellSize));
        if (drawWalls) this.getCell(x, y)?.drawWalls(surface, new Vector2D(x * cellSize, y * cellSize));
      }
    }
  }
}