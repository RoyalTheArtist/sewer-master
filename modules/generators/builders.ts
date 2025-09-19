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
        cell.region = this
        cell.setWalkable(true)
        super.addCell(cell)
    }

    addExit(cell: WalledCell) {
        this.exits.add(cell)
        this.addCell(cell)
    }

    getBorders(): WalledCell[] {
        const borderCells: WalledCell[] = []
        for (const cell of this.getCells().values()) {
            if (cell.x === this.x || cell.x === this.x + this.width - 1 || cell.y === this.y || cell.y === this.y + this.height - 1) {
                borderCells.push(cell)
            }
        }

        return borderCells
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
            if (Room.doesNotOverlap(room, this.rooms)) {
                this.addRoom(room)
            }
        }
    }

    public addRoom(room: Room) {
        room.grid = this.grid
        this.rooms.push(room)
        this.placeRoom(room)
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

    public scaleTo(grid: WalledGrid, scale: number = 2) {
        const rooms: Room[] = []
        for (const room of this.rooms) {
            const newRoom = new Room(room.x * scale, room.y * scale, room.width * scale - 1, room.height * scale - 1, room.color)

            newRoom.grid = grid
            for (let x = newRoom.x; x < (newRoom.x + newRoom.width); x++) {
                for (let y = newRoom.y; y < (newRoom.y + newRoom.height); y++) {
                    const cell = grid.getCell(x, y)
                    if (!cell) continue
                    cell.setWalkable(true)
                    newRoom.addCell(cell)
                }
            }
            rooms.push(newRoom)
        }

        return rooms
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

export class GridPruner {
    deadEnds: WalledCell[] = []
    prunedCells: Set<WalledCell> = new Set()
    constructor(public grid: WalledGrid) {
        
    }

    public identifyDeadEnds() {
        this.deadEnds = []
        
        for (const cell of this.grid.cellsFlat) {
            if (cell.isWalkable() === false) continue
            const walls = []

            for (const direction of DIRECTIONS_CARDINAL) {
                const neighborCell = this.grid.getCell(cell.x + direction[0], cell.y + direction[1])
                if (neighborCell && neighborCell.isWalkable() === false) {
                    walls.push(neighborCell)
                }
            }

            // if it's surrounded on three sides, it's a dead end
            if (walls.length === 3) {
                this.deadEnds.push(cell)
            }

            if (walls.length <= 2) {
                
                const walkableNeighbors = []

                for (const direction of DIRECTIONS_CARDINAL) {
                    const neighborCell = this.grid.getCell(cell.x + direction[0], cell.y + direction[1])
                    if (neighborCell?.isWalkable()) {
                        walkableNeighbors.push(neighborCell)
                    }
                }

                if (walkableNeighbors.length === 1) {
                    this.deadEnds.push(cell)
                }
            }
        }
    }

    public pruneDeadEnds() {
        this.identifyDeadEnds()
        for (const cell of this.deadEnds) {
            cell.setWalkable(false)
            cell.walls = [false, false, false, false]
            this.prunedCells.add(cell)
        }

        return this
    }

    public pruneAll(until: number = 100) {
        this.identifyDeadEnds()
        while (this.deadEnds.length > 0 && until-- > 0) {
            this.pruneDeadEnds()
            this.identifyDeadEnds()
        }
        return this
    }
}


 const cardinalDirections = [[0, 1], [1, 0]] as number[][];

export class GridConnector {
    sortedConnectors: Map<Room, WalledCell[]> = new Map()
    constructor(public grid: WalledGrid, public rooms: Room[]) {}

    public findConnectors(room: Room) {
        const borderingWalls = room.getBorders().reduce((acc, cell) => {
            for (const direction of cardinalDirections) {
                const neighboringCell = this.grid.getCell(cell.x + direction[0], cell.y + direction[1])

                if (neighboringCell?.isWalkable() === false && neighboringCell?.region !== room) {
                    acc.push(neighboringCell)
                    break
                }
            }

            return acc
        }, [] as WalledCell[])
        if (borderingWalls.length === 0) return this
        this.sortedConnectors.set(room, borderingWalls)

        return this
    }

    public collapseConnectors() {
        const processedRooms = new Set<Room>()

        for (const room of this.rooms) {
            this.findConnectors(room)
        }

        while (this.rooms.length > processedRooms.size) {
            const availableRooms = this.rooms.filter(room => !processedRooms.has(room))

           

            const room = availableRooms[0]
            const connectors = this.sortedConnectors.get(room) as WalledCell[]

            const connector = connectors[Math.floor(Math.random() * connectors.length)]

            if (!connector) {
                if (room.exits.size === 0) {
                    console.info("Room has no exits", { room })
                }
            }
            for (const direction of cardinalDirections) {
                const neighborCell = this.grid.getCell(connector.x + direction[0], connector.y + direction[1])

                if (neighborCell?.isWalkable()) {
                    room.addExit(connector)
                    if (!room) console.warn("Room is null", { room, connector, neighborCell })
                    this.pruneConnectors(room)
                    processedRooms.add(room)
                }
            }

            
        }
        return this
    }

    public pruneConnectors(room: Room) {
        const connectors = this.sortedConnectors.get(room)
        if (!connectors) return
        for (const connector of connectors) {
            if (Math.random() * 200 < 3) room.addExit(connector)
        }
        this.sortedConnectors.delete(room)
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