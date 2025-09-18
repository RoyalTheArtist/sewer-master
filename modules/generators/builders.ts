import { DIRECTIONS_CARDINAL } from './utils';
import { Vector2D } from '@engine/utils';
import { Surface } from '@engine/render/surface';
import { Color } from '@engine/utils';
import { Region } from "./region"
import { Grid, Cell } from './grid';

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

export function generateRandomRoom(min: number, max: number, gridWidth: number, gridHeight: number) {
    const width = Math.floor(Math.random() * (max - min) + min) + 1;
    const height = Math.floor(Math.random() * (max - min) + min) + 1;

    const x = Math.floor(Math.random() * (gridWidth - width));
    const y = Math.floor(Math.random() * (gridHeight - height));
    return new Room(x, y, width, height);
}

export class Path extends Region<WalledCell> {
    color: Color
    constructor(color: Color = Color.fromString("white")) {
        super()
        this.color = color
    }

    addCell(cell: WalledCell): void {
        super.addCell(cell)
        if (cell.color) cell.color = this.color
    }
}

export class WalledGrid extends Grid<WalledCell> {
    public draw(surface: Surface, cellSize: number, drawWalls: boolean = true) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.getCell(x, y)?.draw(surface, new Vector2D(x * cellSize, y * cellSize));
        if (drawWalls) this.getCell(x, y)?.drawWalls(surface, new Vector2D(x * cellSize, y * cellSize));
      }
    }
  }
}

export class WalledCell extends Cell {
  private walkable: boolean;
  private _color: Color
    public walls: [boolean, boolean, boolean, boolean] = [false, false, false, false];
    public region: Region<WalledCell> | null = null

  public get color(): Color { return this._color }
  public set color(color: Color) {
    this._color = color
  }

    constructor(x: number, y: number, walkable: boolean = false, walls?: [boolean, boolean, boolean, boolean], color: Color = Color.fromString("black")) {
    super(x, y);
    this.walkable = walkable;
    this.walls = walls || [false, false, false, false];
    this._color = color
    }
    

  public isWalkable(): boolean {
    return this.walkable;
  }

  public setWalkable(walkable: boolean): void {
    this.walkable = walkable;
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

export class Room extends Region<WalledCell> {
    width: number
    height: number
    x: number
    y: number
    color: Color
    exits: Set<WalledCell> = new Set()
 
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

    addCell(cell: WalledCell): void {
        cell.color = this.color
        cell.setWalkable(true)
        super.addCell(cell)
    }

    addExit(cell: WalledCell) {
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

export class RoomBuilder {
    rooms: Room[] = []
    constructor(public grid: WalledGrid, public maxAttempts: number = 50, public minRoomSize: number = 2, public maxRoomSize: number = 6) {

    }

    public start() {
        this.rooms = []
    }

    public addRooms() {
        let attempts = 0
        while (attempts++ < this.maxAttempts) {
            const room = generateRandomRoom(this.minRoomSize, this.maxRoomSize, this.grid.width, this.grid.height)
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
                const cell = this.grid.getCell(i, j);
                if (!cell) continue
                cell.setWalkable(true);

                if (i === room.x) cell.walls[3] = true;
                if (j === room.y) cell.walls[0] = true;
                if (i === room.x + room.width - 1) cell.walls[1] = true;
                if (j === room.y + room.height - 1) cell.walls[2] = true;

                room.addCell(cell);
            }
        }
    }
}

export class MazeBuilder {
    grid: WalledGrid
    maze: Path

    currentCell: WalledCell | null = null
    unvisitedCells: Set<WalledCell>
    cellStack: WalledCell[] = []
    constructor(grid: WalledGrid) {
        this.grid = grid
        this.maze = new Path(PATH_PALETTE[Math.floor(Math.random() * PATH_PALETTE.length)])
        this.unvisitedCells = new Set(this.grid.cellsFlat.filter(cell => !cell.isWalkable()))
    }

    static new(width: number, height: number) {
        const grid = new WalledGrid(width, height)
        return new MazeBuilder(grid)
    }

    public start() {
        this.unvisitedCells = new Set(this.grid.cellsFlat.filter(cell => !cell.isWalkable()))
        
        this.maze.clear()
        this.maze.color = PATH_PALETTE[Math.floor(Math.random() * PATH_PALETTE.length)]
        while (this.currentCell === null) {
            const startX = Math.floor(Math.random() * this.grid.width)
            const startY = Math.floor(Math.random() * this.grid.height)

            const cell = this.grid.getCell(startX, startY)
            if (cell && this.unvisitedCells.has(cell)) {
                cell.walls = [true, true, true, true]

                this.addToMaze(cell)
            }
        }
    }

    public carve() {
        if (!this.currentCell) return

        const cx = this.currentCell.x
        const cy = this.currentCell.y

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
            const nextCell = this.grid.getCell(cx + nextDirection[0], cy + nextDirection[1])
            if (!nextCell) return
            this.currentCell.breakWall(nextDirection)

            nextCell.walls = [true, true, true, true]
            nextCell.breakWall([-nextDirection[0], -nextDirection[1]])

            this.addToMaze(nextCell)
        } else if (this.cellStack.length > 0) {
            this.currentCell = this.cellStack.pop() || null
        }

        if (this.cellStack.length === 0) {
            this.currentCell = null
        }

        const cellsRemaining = Array.from(this.unvisitedCells)
        if (cellsRemaining.length === 0 || this.currentCell !== null) return

        this.addToMaze(cellsRemaining[Math.floor(Math.random() * cellsRemaining.length)])
    }

    public addToMaze(cell: WalledCell) {
        this.currentCell = cell
        cell.setWalkable(true)
        this.unvisitedCells.delete(cell)
        this.cellStack.push(cell) 
        this.maze.addCell(cell)
    }

    public scaleMaze() {
        const grid = new WalledGrid(this.grid.width * 2, this.grid.height * 2).fill((x, y) => new WalledCell(x, y, false, [true, true, true, true]))
        const scaledMaze = new Path(this.maze.color)
        const sortedCells = Array.from(this.maze.getCells()).sort((cellA, cellB) => cellA.x - cellB.x || cellA.y - cellB.y)
        for (const cell of sortedCells) {
            const x = cell.x * 2
            const y = cell.y * 2

            const targetCell = grid.getCell(x, y)
            if (!targetCell) continue
            targetCell.setWalkable(cell.isWalkable())
            scaledMaze.addCell(targetCell)

            for (const [index, hasWall] of cell.walls.entries()) {
                if (hasWall) continue

                const direction = DIRECTIONS_CARDINAL[index]

                if (!direction) continue

                const wallCell = grid.getCell(x  + direction[0], y + direction[1])

                if (wallCell && !this.maze.hasCell(wallCell)) {
                    wallCell.setWalkable(cell.isWalkable())
                    scaledMaze.addCell(wallCell)
                } 
            }
        }

        return { grid, maze: scaledMaze }
    }
}

export class GridBuilder {
    grid: WalledGrid
    constructor(width: number, height: number) {
        this.grid = new WalledGrid(width, height)
        this.grid.fill((x, y) => new WalledCell(x, y, false, [true, true, true, true]))
    }

    public closeWalls() {
        for (const cell of this.grid.cellsFlat) {
            if (!cell.isWalkable()) continue

            for (const [index, hasWall] of cell.walls.entries()) {
                if (hasWall) continue
                const direction = DIRECTIONS_CARDINAL[index]
                if (!direction) continue
                const neighborCell = this.grid.getCell(cell.x + direction[0], cell.y + direction[1])
                if (!neighborCell?.isWalkable()) {
                    cell.walls[index] = true
                }
            }

        }
    }
}