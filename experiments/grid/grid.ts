export class Cell {
  private x: number;
  private y: number;
  private walkable: boolean;
  private cost: number;

  constructor(x: number, y: number, walkable: boolean = true, cost: number = 1) {
    this.x = x;
    this.y = y;
    this.walkable = walkable;
    this.cost = cost;
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
}

export class Grid {
  private width: number;
  private height: number;
  private cells: Cell[][];

  constructor(width: number, height: number) {
    this.width = width;
      this.height = height;
      
      this.cells = new Array(height).fill(0).map((_, y) => new Array(width).fill(0).map((_, x) => new Cell(x, y, true, 1)));
      
    // this.cells = new Array(height).fill(0).map(() => new Array(width).fill(0).map(() => new Cell(0, 0, true, 1)));
      
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public getCell(x: number, y: number): Cell {
    return this.cells[y][x];
  }

  public setCell(x: number, y: number, cell: Cell): void {
    this.cells[y][x] = cell;
  }

  public isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public isWalkable(x: number, y: number): boolean {
    return this.getCell(x, y).isWalkable();
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

  public getNeighbors(x: number, y: number): Cell[] {
    const neighbors: Cell[] = [];
    for (const dx of [-1, 0, 1]) {
      for (const dy of [-1, 0, 1]) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (this.isWithinBounds(nx, ny)) {
          neighbors.push(this.getCell(nx, ny));
        }
      }
    }
    return neighbors;
  }
}