import { Vector2D } from '@engine/utils';


export interface ICell {
  x: number
  y: number
  position: Vector2D
}



export class Cell implements ICell {
  private _pos: Vector2D

  public get position(): Vector2D { return this._pos }
  public get x(): number { return this._pos.x }
  public get y(): number { return this._pos.y }

  constructor(x: number, y: number) {
    this._pos = new Vector2D(x, y)
  }

  setPosition(x: number, y: number) { 
    this._pos.x = x
    this._pos.y = y
   }
}


export interface IGrid {
  readonly width: number;
  readonly height: number;
  readonly cells: Cell[][];
  readonly cellsFlat: Cell[]

  getCell(x: number, y: number): Cell | undefined
  setCell(x: number, y: number, cell: Cell): void
  isWithinBounds(x: number, y: number): boolean
  fill(fillFn: (x: number, y: number) => Cell): IGrid
  getNeighborCells(x: number, y: number): Cell[]
}

export abstract class Grid<T extends Cell> implements IGrid {
  private _width: number;
  private _height: number;
  private _cells: T[][] = [];
  private _fillFn!: (x: number, y: number) => T

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public get cells(): T[][] {
    return this._cells;
  }

  public get cellsFlat(): T[] {
    return this._cells.flat();
  }

  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
    
  }

  public getCell(x: number, y: number): T | undefined{
    if (!this.isWithinBounds(x, y)) return undefined;
    return this.cells[y][x] as T;
  }

  public setCell(x: number, y: number, cell: T): void {
    cell.setPosition(x, y);
    this.cells[y][x] = cell;
  }

  public isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public fill(fillFn: (x: number, y: number) => T) {
    this._fillFn = fillFn
    this._cells = new Array(this.height).fill(0).map((_, y) => new Array(this.width).fill(0).map((_, x) => fillFn(x, y)));

    // for (let y = 0; y < this.height; y++) {
    //     for (let x = 0; x < this.width; x++) {
    //         this.cells[y][x] = fillFn(x, y)
    //     }
    // }
    return this
  }

  public reset() {
    if (!this._fillFn)
      this._cells = new Array(this.height).fill(0).map((_, y) => new Array(this.width).fill(0).map((_, x) => this._fillFn(x, y))); 
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
            this.cells[y][x] = this._fillFn(x, y)
        }
      }
  }

  public getNeighborCells(x: number, y: number): T[] {
    const neighbors: T[] = [];
    for (const dx of [-1, 0, 1]) {
      for (const dy of [-1, 0, 1]) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (this.isWithinBounds(nx, ny)) {
          neighbors.push(this.getCell(nx, ny) as T);
        }
      }
    }
    return neighbors;
  }

  public getCellsInRect(x: number, y: number, width: number, height: number): T[] {
    const cells: T[] = [];
    for (let iy = y; iy < y + height; iy++) {
      for (let ix = x; ix < x + width; ix++) {
        const cell = this.getCell(ix, iy);
        if (cell) cells.push(cell);
      }
    }
    return cells;
  }
}