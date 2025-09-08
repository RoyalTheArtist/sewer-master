import { Surface } from '@engine/render/surface';
//import { Cell } from '../grid/grid';

const RENDER_CONFIG = {
    type: "graphics",
    elem: "app",
    resolution: {
        width: 800,
        height: 600
    }
} as const

const GRID_INFO = {
  resolution: {
    width: 600,
    height: 240
  },
  cellSize: 15
}

class Grid<T extends Cell> {
  public cells: T[][];
  public size: number
  constructor(public width: number, public height: number, initialValue: T) {
    this.cells = new Array(height).fill(0).map((_, y) => new Array(width).fill(0).map((_, x) => ({ ...initialValue, x, y})));
    this.size = width * height
  }

  public getCell(x: number, y: number): T {
    return this.cells[y][x];
  }

  public setCell(x: number, y: number, cell: T): void {
    this.cells[y][x] = cell;
  }

  public isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
}

function drawColoredSquare(ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number, color: "red" | "blue" | "orange" | "white") {
  ctx.fillStyle = color;
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

// function createRoomWalls(grid: Grid, x: number, y: number, width: number, height: number) {
//   for (let i = 0; i < width; i++) {
//     grid.getCell(x + i, y).setWalkable(false); // top wall
//     grid.getCell(x + i, y + height - 1).setWalkable(false); // bottom wall
//   }

//   for (let i = 0; i < height; i++) {
//     grid.getCell(x, y + i).setWalkable(false); // left wall
//     grid.getCell(x + width - 1, y + i).setWalkable(false); // right wall
//   }
// }

class Cell {
  public populated: boolean = false;
  constructor(public x: number, public y: number) {}
}

function randomlyPopulateGrid(grid: Grid<Cell>) {
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      grid.cells[y][x].populated = Math.random() > 0.8;
    }
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, grid: Grid<Cell>) {
  const cells = grid.cells.flat();

  for(let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const cell = grid.cells[y][x];
      if (cell.populated) {
        drawColoredSquare(ctx, x, y, GRID_INFO.cellSize, "blue");
      } else {
        drawColoredSquare(ctx, x, y, GRID_INFO.cellSize, "white");
      }
    }
  }
}

function drawCells(ctx: CanvasRenderingContext2D, cells: Cell[], color: "red" | "blue" | "orange" | "white") {
  for (let cell of cells) {
    drawColoredSquare(ctx, cell.x, cell.y, GRID_INFO.cellSize, color);
  }
}

function getNeighbors(cell: Cell, grid: Grid<Cell>) {
  const all = []
  const populated = []
  const unpopulated = []
  for (const dx of [-1, 0, 1]) {
    for (const dy of [-1, 0, 1]) {
      if (dx === 0 && dy === 0) continue;
      const nx = cell.x + dx;
      const ny = cell.y + dy;
      if (grid.isWithinBounds(nx, ny)) {
        const neighbor = grid.getCell(nx, ny);
        all.push(neighbor);
        if (neighbor.populated) {
          populated.push(neighbor);
        } else {
          unpopulated.push(neighbor);
        }
      }
    }
  }
  return { all, populated, unpopulated };
}

const conwayProcess = (grid: Grid<Cell>) => {
  const populatedCells = grid.cells.flat().filter(cell => cell.populated);
  const unpopulatedCells = grid.cells.flat().filter(cell => !cell.populated);
  const cellsToChange: Set<Cell> = new Set();

  const unpopulatedNeighbors: Map<Cell, Set<Cell>> = new Map();
  
  const populatedCellsToChange = []
  const unpopulatedCellsToChange: Cell[] = []

  for (const cell of populatedCells) {
    const neighbors = getNeighbors(cell, grid);
  
    if (neighbors.populated.length < 2 || neighbors.populated.length > 3) {
      cellsToChange.add(cell);
      populatedCellsToChange.push(cell);
    }

    for (const neighbor of neighbors.unpopulated) {
      if (!unpopulatedNeighbors.has(neighbor)) {
        unpopulatedNeighbors.set(neighbor, new Set());
      }
      unpopulatedNeighbors.get(neighbor)!.add(cell);
    }
  }

  for (const [unpopulatedCell, populatedNeighbors] of unpopulatedNeighbors) {
    if (populatedNeighbors.size === 3) {
      cellsToChange.add(unpopulatedCell);
      unpopulatedCellsToChange.push(unpopulatedCell);
    }
  }

  return { populatedCells, unpopulatedCells, unpopulatedNeighbors, cellsToChange, populatedCellsToChange, unpopulatedCellsToChange };
}

function main() {
  const canvas = document.getElementById("app") as HTMLCanvasElement
  const surface = new Surface(canvas, GRID_INFO.resolution.width, GRID_INFO.resolution.height);
  surface.initialize();
  const ctx = surface.context;
  
  const grid = new Grid<Cell>(GRID_INFO.resolution.width / GRID_INFO.cellSize, GRID_INFO.resolution.height / GRID_INFO.cellSize, new Cell(0, 0));


  randomlyPopulateGrid(grid);

  let processedCells = conwayProcess(grid);
  drawCells(ctx, processedCells.unpopulatedCells, "white");
  drawCells(ctx, processedCells.populatedCells, "blue");
  drawCells(ctx, processedCells.populatedCellsToChange, "red");
  drawCells(ctx, processedCells.unpopulatedCellsToChange, "orange");
  // drawGrid(ctx, grid);
  const stepBtn = document.getElementById("step") as HTMLButtonElement;
  stepBtn.onclick = () => {
    for (const cell of processedCells.cellsToChange) {
      cell.populated = !cell.populated;
    }

    processedCells = conwayProcess(grid);
  
    drawCells(ctx, processedCells.unpopulatedCells, "white");
    drawCells(ctx, processedCells.populatedCells, "blue");
    // drawCells(ctx, [...processedCells.cellsToChange], "red");
    // drawGrid(ctx, grid);
  }
}

window.onload = () => { main() }