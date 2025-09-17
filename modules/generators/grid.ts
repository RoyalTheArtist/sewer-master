import { Cell } from './cell';

export class Grid<T extends any> {
  private width: number;
  private height: number;
  private cells: Cell<T>[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
      
    this.cells = new Array(height).fill(0).map((_, y) => new Array(width).fill(0)); 
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public getCell(x: number, y: number): Cell<T> | undefined {
    if (!this.isWithinBounds(x, y)) return undefined;
    return this.cells[y][x];
  }

  public setCell(x: number, y: number, cell: Cell<T>): void {
    this.cells[y][x] = cell;
  }

  public isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

    public fill(fill: (x: number, y: number) => T) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.cells[y][x].data = fill(x, y)
            }
        }
        return this
    }

  public getAllCells(): Cell<T>[] {
    const allCells: Cell<T>[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        allCells.push(this.getCell(x, y) as Cell<T>);
      }
    }
    return allCells;
  }

  public getNeighbors(x: number, y: number): Cell<T>[] {
    const neighbors: Cell<T>[] = [];
    for (const dx of [-1, 0, 1]) {
      for (const dy of [-1, 0, 1]) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (this.isWithinBounds(nx, ny)) {
          neighbors.push(this.getCell(nx, ny) as Cell<T>);
        }
      }
    }
    return neighbors;
  }
}