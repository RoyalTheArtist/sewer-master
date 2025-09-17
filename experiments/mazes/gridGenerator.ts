import { Color } from "@engine/utils"
import { Cell, Grid, Region } from "../grid/grid"

const DIRECTIONS_CARDINAL = [[0, -1], [1, 0], [0, 1], [-1, 0]]

const ROOM_PALETTE = [
    new Color(201, 204, 161, 1),
    new Color(174, 106, 71),
    new Color(84, 51, 68),
    new Color(99, 120, 125),
]

const PATH_PALETTE = [
    new Color(202, 160, 90),
    new Color(139, 64, 73),
    new Color(81, 82, 98),
    new Color(142, 160, 145)
]

function generateRandomRoom(min: number, max: number, gridWidth: number, gridHeight: number) {
    const width = Math.floor(Math.random() * (max - min) + min) + 1;
    const height = Math.floor(Math.random() * (max - min) + min) + 1;

    const x = Math.floor(Math.random() * (gridWidth - width));
    const y = Math.floor(Math.random() * (gridHeight - height));
    return new Room(x, y, width, height);
}

export class Path extends Region {
    color: Color
    constructor(color: Color = Color.fromString("white")) {
        super()
        this.color = color
    }

    addCell(cell: Cell): void {
        super.addCell(cell)
        cell.color = this.color
    }
}



export class Room extends Region {
    width: number
    height: number
    x: number
    y: number
    color: Color
    exits: Set<Cell> = new Set()
 
    constructor(x: number, y: number, width: number, height: number, palette: Color[] | Color = ROOM_PALETTE) {
        super()
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        if (Array.isArray(palette)) {
            this.color = palette[Math.floor(Math.random() * palette.length)]
        } else {
            this.color = palette
        }
    }

    addCell(cell: Cell): void {
        cell.color = this.color
        cell.setWalkable(true)
        super.addCell(cell)
    }

    addExit(cell: Cell) {
        this.exits.add(cell)
        this.addCell(cell)
    }

    static doesNotOverlap(room: Room, rooms: Room[]) {
        for (let r of rooms) {
            if (room.x < r.x + r.width && room.x + room.width > r.x && room.y < r.y + r.height && room.y + room.height > r.y) {
                return false;
            }
        }
        return true
    }

}
class RoomBuilder {
    rooms: Room[] = []
    constructor(public grid: Grid, public maxAttempts: number = 50, public minRoomSize: number = 2, public maxRoomSize: number = 6) {

    }

    public start() {
        this.rooms = []
    }

    public addRooms() {
        let attempts = 0
        while (attempts++ < this.maxAttempts) {
            const room = generateRandomRoom(this.minRoomSize, this.maxRoomSize, this.grid.getWidth(), this.grid.getHeight())
            this.addRoom(room)
        }
    }

    public addRoom(room: Room) {
        if (Room.doesNotOverlap(room, this.rooms)) {
            room.grid = this.grid
            this.rooms.push(room)
            this.placeRoom(room)
        }
    }

    public placeRoom(room: Room) {
        for (let i = room.x; i < room.x + room.width; i++) {
            for (let j = room.y; j < room.y + room.height; j++) {
                const cell = this.grid.getCell(i, j) as Cell;
                cell?.setWalkable(true);

                if (i === room.x) cell.walls[3] = true;
                if (j === room.y) cell.walls[0] = true;
                if (i === room.x + room.width - 1) cell.walls[1] = true;
                if (j === room.y + room.height - 1) cell.walls[2] = true;

                room.addCell(cell);
            }
        }
    }
}

class MazeBuilder {
    grid: Grid
    maze: Path

    currentCell: Cell | null = null
    unvisitedCells: Set<Cell>
    cellStack: Cell[] = []
    constructor(grid: Grid) {
        this.grid = grid
        this.maze = new Path(PATH_PALETTE[Math.floor(Math.random() * PATH_PALETTE.length)])
        this.unvisitedCells = new Set(this.grid.getAllCells())
    }

    static new(width: number, height: number) {
        const grid = new Grid(width, height)
        return new MazeBuilder(grid)
    }

    public start() {
        const emptyCells = this.grid.getAllCells().filter(cell => !cell.isWalkable())
        this.unvisitedCells = new Set(emptyCells)
        
        this.maze.clear()
        this.maze.color = PATH_PALETTE[Math.floor(Math.random() * PATH_PALETTE.length)]
        while (this.currentCell === null) {
            const startX = Math.floor(Math.random() * this.grid.getWidth())
            const startY = Math.floor(Math.random() * this.grid.getHeight())

            const cell = this.grid.getCell(startX, startY)
            if (cell && this.unvisitedCells.has(cell)) {
                cell.walls = [true, true, true, true]

                this.addToMaze(cell)
            }
        }
    }

    public carve() {
        if (!this.currentCell) return

        const cx = this.currentCell.getX()
        const cy = this.currentCell.getY()

        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
        const neighborDirections = directions.reduce(
            (prev, curr) => {
                const neighborCell = this.grid.getCell(cx + curr[0], cy + curr[1])
                if (neighborCell && this.unvisitedCells.has(neighborCell)) {
                    prev.push(curr)
                }

                return prev
            },
            [] as number[][])
        
        const nextDirection = neighborDirections[Math.floor(Math.random() * neighborDirections.length)]

        if (nextDirection) {
            const nextCell = this.grid.getCell(cx + nextDirection[0], cy + nextDirection[1]) as Cell
           
            this.currentCell.breakWall(nextDirection)

            nextCell.walls = [true, true, true, true]
            nextCell.breakWall([-nextDirection[0], -nextDirection[1]])

            this.addToMaze(nextCell)
        } else if (this.cellStack.length > 0) {
            this.currentCell = this.cellStack.pop() as Cell
        }

        if (this.cellStack.length === 0) {
            this.currentCell = null
        }

        const cellsRemaining = Array.from(this.unvisitedCells)
        if (cellsRemaining.length === 0 || this.currentCell !== null) return

        this.addToMaze(cellsRemaining[Math.floor(Math.random() * cellsRemaining.length)])
    }

    public addToMaze(cell: Cell) {
        this.currentCell = cell
        cell.setWalkable(true)
        this.unvisitedCells.delete(cell)
        this.cellStack.push(cell) 
        this.maze.addCell(cell)
    }

    public scaleMaze() {
        const grid = new Grid(this.grid.getWidth() * 2, this.grid.getHeight() * 2)
        const scaledMaze = new Path(this.maze.color)
        const sortedCells = Array.from(this.maze.getCells()).sort((cellA, cellB) => cellA.getX() - cellB.getX() || cellA.getY() - cellB.getY())
        for (const cell of sortedCells) {
            const x = cell.getX() * 2
            const y = cell.getY() * 2

            const targetCell = grid.getCell(x, y) as Cell
            targetCell.setWalkable(cell.isWalkable())
            scaledMaze.addCell(targetCell)

            for (const [index, hasWall] of cell.walls.entries()) {
                if (hasWall) continue

                const direction = DIRECTIONS_CARDINAL[index]

                if (!direction) continue

                const wallCell = grid.getCell(x  + direction[0], y + direction[1]) as Cell

                if (wallCell && !this.maze.hasCell(wallCell)) {
                    wallCell.setWalkable(cell.isWalkable())
                    scaledMaze.addCell(wallCell)
                } 
            }
        }

        return { grid, maze: scaledMaze }
    }
}

class GridBuilder {
    grid: Grid
    constructor(width: number, height: number) {
        this.grid = new Grid(width, height)
    }

    public closeWalls() {
        for (const cell of this.grid.getAllCells()) {
            if (!cell.isWalkable()) continue

            for (const [index, hasWall] of cell.walls.entries()) {
                if (hasWall) continue
                const direction = DIRECTIONS_CARDINAL[index]
                if (!direction) continue
                const neighborCell = this.grid.getCell(cell.getX() + direction[0], cell.getY() + direction[1]) as Cell
                if (!neighborCell?.isWalkable()) {
                    cell.walls[index] = true
                }
            }

        }
    }
}

export type RoomsAndMazesOptions = {
    maxRoomAttempts?: number
    minRoomSize?: number
    maxRoomSize?: number
}

export class RoomsAndMazes extends GridBuilder {
    roomBuilder: RoomBuilder
    mazeBuilder: MazeBuilder
    constructor(width: number, height: number, options?: RoomsAndMazesOptions) {
        super(width, height)
        this.roomBuilder = new RoomBuilder(this.grid, options?.maxRoomAttempts, options?.minRoomSize, options?.maxRoomSize)
        this.mazeBuilder = new MazeBuilder(this.grid)
    }

    public start() {
        this.grid.resetGrid()
        this.roomBuilder.start()
        this.roomBuilder.addRooms()
        this.mazeBuilder.start()
    }

    public step() {
        this.mazeBuilder.carve()

        return this.mazeBuilder.currentCell !== null
    }

    public bake(factor: number = 2) {
        const { grid, maze } = this.mazeBuilder.scaleMaze()

        const rooms = []
        for (const room of this.roomBuilder.rooms) {
            const newRoom = new Room(room.x * factor, room.y * factor, room.width * factor - 1, room.height * factor - 1, room.color)
            rooms.push(newRoom)
        }

        return { grid, maze, rooms }
    }
}