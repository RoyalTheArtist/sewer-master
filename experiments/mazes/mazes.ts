import { Surface } from "@engine/render/surface";
import { Cell, Grid } from "../grid/grid";
import { Color, Vector2D } from "@engine/utils";

const GRID_INFO = {
  width: 80,
  height: 40,
  cellSize: 5
}

const ROOM_INFO = {
    maxAttempts: 600,
    minSize: 3,
    maxSize: 12
}

const ROOM_PALETTE = [
    new Color(201, 204, 161, 1),
    new Color(174, 106, 71),
    new Color(84, 51, 68),
    new Color(99, 120, 125),
]

const ROUTE_PALETTE = [
    new Color(202, 160, 90),
    new Color(139, 64, 73),
    new Color(81, 82, 98),
    new Color(142, 160, 145)
]


function drawMaze(grid: Grid, surface: Surface, cellSize: number) {
    surface.drawRect(new Vector2D(0, 0), new Vector2D(800, 600), Color.fromString("black")); 
    for(let y = 0; y < grid.getHeight(); y++) {
        for (let x = 0; x < grid.getWidth(); x++) {
            const cell = grid.getCell(x, y);
            if (cell === currentCell) {
                surface.drawRect(new Vector2D(x * cellSize, y * cellSize), new Vector2D(cellSize, cellSize), Color.fromString("blue"));
            } else if (cell?.isWalkable()) {
                surface.drawRect(new Vector2D(x * cellSize, y * cellSize), new Vector2D(cellSize, cellSize), cell.color);
            }
        }
    }
}

const placeRoom = (x: number, y: number, width: number, height: number, grid: Grid) => {
    const color = ROOM_PALETTE[Math.floor(Math.random() * ROOM_PALETTE.length)];

    for (let i = x; i < x + width; i++) {
        for (let j = y; j < y + height; j++) {
            const cell = grid.getCell(i, j) as Cell;
            cell.color = color;
            cell?.setWalkable(true);
        }
    }
}

const visitedCells = new Set<Cell>();
const unvisitedCells = new Set<Cell>();
let currentCell: Cell | null = null;
const cellStack = [] as Cell[];
const routeColor = ROUTE_PALETTE[Math.floor(Math.random() * ROUTE_PALETTE.length)];


function getOppositeCorners(x: number, y: number, currentDirection: number[]) {
    if (currentDirection[0] === 0) {
        return [[x - 1, y + currentDirection[1]], [x + 1, y + currentDirection[1]]];
    } else {
        return [[x + currentDirection[0], y - 1], [x + currentDirection[0], y + 1]]; 
    }
}


function canCarve(grid: Grid, x: number, y: number): boolean {
    if (!currentCell) return false;
    const currentDirection = [x - currentCell.getX(), y - currentCell.getY()];

    const cardinalDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    //const ordinalDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
   
    // for (let direction of ordinalDirections) {
    //     const neighborCell = grid.getCell(x + direction[0], y + direction[1]);
    //     if (neighborCell && neighborCell.isWalkable() ) {
    //         return false;
    //     }
    // }
    const walkableTiles = [] as Cell[]
    
    for (let direction of cardinalDirections) {
        const neighborCell = grid.getCell(x + direction[0], y + direction[1]);
        if (neighborCell && neighborCell.isWalkable() && neighborCell !== currentCell) {
            walkableTiles.push(neighborCell);
        }
    }

    const oppositeCorners = getOppositeCorners(x, y, currentDirection);

    for (let corner of oppositeCorners) {
        const cell = grid.getCell(corner[0], corner[1]);
        if (cell?.isWalkable()) return false
    }

    if (walkableTiles.length > 0) {
        return false;
    }
    return true;
}

function carvePassage(grid: Grid) {
    if (!currentCell) {
        console.log("Maze finished?")
        return;
    }

    currentCell.color = routeColor;
    currentCell.setWalkable(true);
    visitedCells.add(currentCell);
    unvisitedCells.delete(currentCell);
    const cx = currentCell?.getX();
    const cy = currentCell?.getY();

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const neighbors = directions.reduce((prev, curr) => { 
        const neighborCell = grid.getCell(cx + curr[0], cy + curr[1]);
        if (neighborCell && !visitedCells.has(neighborCell) && canCarve(grid, neighborCell.getX(), neighborCell.getY()) && grid.isWithinBounds(cx + curr[0], cy + curr[1])) {
            prev.push(neighborCell);
        }

        return prev;
    }, [] as Cell[]);  
    
    const nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
    
    if (nextCell) {
        visitedCells.add(nextCell);
        cellStack.push(currentCell);
        currentCell = nextCell;
    } else if (cellStack.length > 0) {
        currentCell = cellStack.pop() as Cell;
    }

    if (cellStack.length === 0) {
        currentCell = null;
    }

    // for (let direction of directions) {
        
        
    //     if (grid.isWithinBounds(x, y) && !visitedCells.has(cell)) {
    //         grid.getCell(cx, cy).setWalkable(true);
    //         //grid.getCell(x, y).setWalkable(false);
    //         //carvePassage(x, y, grid);
    //     }
    // }
}

function getRandomStartingPoint(grid: Grid) {
    const startX = Math.floor(Math.random() * grid.getWidth());
    const startY = Math.floor(Math.random() * grid.getHeight());
    const cell = grid.getCell(startX, startY) as Cell;
    if (!cell.isWalkable()) return cell;
    return getRandomStartingPoint(grid);
}

function generateRandomRoom(maxSize: number, minSize: number, gridWidth: number, gridHeight: number) {
    const width = Math.floor(Math.random() * (maxSize - minSize) + minSize);
    const height = Math.floor(Math.random() * (maxSize - minSize) + minSize);

    const x = Math.floor(Math.random() * (gridWidth - width));
    const y = Math.floor(Math.random() * (gridHeight - height));
    
    return new Room(x, y, width, height);
}

class Room {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

function doesNotOverlap(newRoom: Room, rooms: Room[]) {
    for (let r of rooms) {
        if (newRoom.x < (r.x - 1) + (r.width + 2) && (newRoom.x - 1) + (newRoom.width + 2) > r.x && newRoom.y < (r.y - 1) + (r.height + 2) && (newRoom.y - 1) + (newRoom.height + 2) > r.y) {
            return false;
        }
        
    }
    return true;
}

function placeRooms(grid: Grid, maxAttempts: number = 100) {
    const rooms = [] as Room[]
    let attempts = 0

    while (attempts < maxAttempts) {
        const room = generateRandomRoom(ROOM_INFO.minSize, ROOM_INFO.maxSize, grid.getWidth(), grid.getHeight());
        if (doesNotOverlap(room, rooms)) {
            rooms.push(room);
            placeRoom(room.x, room.y, room.width, room.height, grid);
        }

        attempts++;
    }
   

    //placeRoom(x, y, width, height, grid);
}

function generateGrid(grid: Grid) {
    unvisitedCells.clear();
    visitedCells.clear();
    grid.resetGrid();

    const startX = Math.floor(grid.getWidth() / 2);
    const startY = Math.floor(grid.getHeight() / 2);
    currentCell = grid.getCell(startX, startY) as Cell;

    placeRooms(grid, ROOM_INFO.maxAttempts);

    cellStack.push(currentCell);

    for (const cell of grid.getAllCells()) {
        if (!cell.isWalkable()) {
            unvisitedCells.add(cell);
        }
    }
}

function findConnectors(grid: Grid) {
    const cardinalDirections = [[0, 1], [1, 0]] as number[][];

    const connectors = [] as Cell[]

    for (const cell of grid.getAllCells().filter(cell => !cell.isWalkable())) {
        for (const direction of cardinalDirections) {
            const neighborCell = grid.getCell(cell.getX() + direction[0], cell.getY() + direction[1]) as Cell;
            const secondNeighbor = grid.getCell(cell.getX() + direction[0] * -1, cell.getY() + direction[1] * -1) as Cell;
            
            if (neighborCell?.isWalkable() && secondNeighbor?.isWalkable() && neighborCell?.color !== secondNeighbor?.color) {
                connectors.push(cell);
            }
        }
    }

    return connectors
}

function drawConnectors(cells: Cell[], surface: Surface, cellSize: number) {
    const connectorRadius = 1;
    for (const cell of cells) {
        const centerX = cell.getX() * cellSize + cellSize / 2;
        const centerY = cell.getY() * cellSize + cellSize / 2;

        surface.drawCircle(new Vector2D(centerX, centerY), connectorRadius, Color.fromString("white"));
    }
}



function main() {
    const canvas = document.getElementById("app") as HTMLCanvasElement
    const surface = new Surface(canvas, GRID_INFO.width * GRID_INFO.cellSize, GRID_INFO.height * GRID_INFO.cellSize);
    surface.initialize();

    const grid = new Grid(GRID_INFO.width, GRID_INFO.height);

    // placeRoom(15, 15, 10, 10, grid)
    // placeRoom(28, 15, 6, 6, grid)

    // placeRoom(28, 24, 8, 5, grid)
    // placeRoom(8, 30, 15, 5, grid)
    placeRooms(grid, ROOM_INFO.maxAttempts);

    const stepBtn = document.getElementById("step") as HTMLButtonElement;

    stepBtn.onclick = () => {
        if (!currentCell) {
            currentCell = getRandomStartingPoint(grid);
        };
        carvePassage(grid);
        drawMaze(grid, surface, GRID_INFO.cellSize);
    }

    const generateBtn = document.getElementById("generate") as HTMLButtonElement;

    generateBtn.onclick = () => {
        if (!currentCell) {
            generateGrid(grid);
        };
        while(currentCell !== null) {
            carvePassage(grid);
        }
        drawMaze(grid, surface, GRID_INFO.cellSize);
        const connectors = findConnectors(grid);
        drawConnectors(connectors, surface, GRID_INFO.cellSize);
    }

    const clearBtn = document.getElementById("clear") as HTMLButtonElement;

    clearBtn.onclick = () => {
        grid.resetGrid();
        currentCell = getRandomStartingPoint(grid);
        placeRooms(grid)
        drawMaze(grid, surface, GRID_INFO.cellSize);
    }
    
    generateGrid(grid);

    drawMaze(grid, surface, GRID_INFO.cellSize);
}

main()