import { Surface } from '@engine/render/surface';
import { Grid, Cell } from './grid';
import { Pathfinding } from './pathfinding';

const RENDER_CONFIG = {
    type: "graphics",
    elem: "app",
    resolution: {
        width: 800,
        height: 600
    }
} as const

const GRID_INFO = {
  width: 50,
  height: 30,
  cellSize: 12
}

function drawGrid(grid: Grid, ctx: CanvasRenderingContext2D, cellSize: number) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.width);

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;

  for (let y = 0; y <= grid.getHeight(); y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(grid.getWidth() * cellSize, y * cellSize);
    ctx.stroke();
  }

  for (let x = 0; x <= grid.getWidth(); x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, grid.getHeight() * cellSize);
    ctx.stroke();
  }
}

function drawColoredSquare(ctx: CanvasRenderingContext2D, cellSize: number, coordinates: [number, number][], color: "red" | "blue" | "orange" | "white") {
  ctx.fillStyle = color;

  for (const [x, y] of coordinates) {
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }
}

function createRoomWalls(grid: Grid, x: number, y: number, width: number, height: number) {
  for (let i = 0; i < width; i++) {
    grid.getCell(x + i, y).setWalkable(false); // top wall
    grid.getCell(x + i, y + height - 1).setWalkable(false); // bottom wall
  }

  for (let i = 0; i < height; i++) {
    grid.getCell(x, y + i).setWalkable(false); // left wall
    grid.getCell(x + width - 1, y + i).setWalkable(false); // right wall
  }
}

function main() {
    const canvas = document.getElementById("app") as HTMLCanvasElement
    const surface = new Surface(canvas, 800, 600);
    surface.initialize();
    const ctx = surface.context;
    const grid = new Grid(GRID_INFO.width, GRID_INFO.height);
    const pathfinding = new Pathfinding(grid);
    
    grid.getCell(3, 5).setWalkable(false)

    createRoomWalls(grid, 0, 0, grid.getWidth(), grid.getHeight())

    drawGrid(grid, ctx, GRID_INFO.cellSize);

    const blockedCells = grid.getBlockedCells();
    
    for (let cell of blockedCells) {
        const [x, y] = cell.coordinates;
        
        drawColoredSquare(ctx, GRID_INFO.cellSize, [[x, y]], "orange");
    }

    const path = pathfinding.findPath(grid.getCell(2, 4), grid.getCell(6, 6));


    for (let cell of path) {
        const [x, y] = cell.coordinates;
        
        drawColoredSquare(ctx, GRID_INFO.cellSize, [[x, y]], "blue");
    }
}

window.onload = () => { main() }