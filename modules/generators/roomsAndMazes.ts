import { GridBuilder, GridConnector, GridPruner, MazeBuilder, Path, Room, RoomBuilder, WalledGrid } from './builders';
export type RoomsAndMazesOptions = {
    maxRoomAttempts?: number
    minRoomSize?: number
    maxRoomSize?: number
    pruneAmount?: number
}

export class RoomsAndMazesBuilder extends GridBuilder {
    roomBuilder: RoomBuilder
    mazeBuilder: MazeBuilder
    connector
    pruner = new GridPruner(this.grid)
    constructor(width: number, height: number, options?: RoomsAndMazesOptions) {
        super(width, height)
        this.roomBuilder = new RoomBuilder(this.grid, options?.maxRoomAttempts, options?.minRoomSize, options?.maxRoomSize)
        this.mazeBuilder = new MazeBuilder(this.grid)

        this.connector = new GridConnector(this.grid, this.roomBuilder.rooms)
        this.pruner = new GridPruner(this.grid)
    }

    public start() {
        this.grid.reset()
        this.roomBuilder.start()
        this.roomBuilder.addRooms()
        this.mazeBuilder.start()
    }

    public step() {
        this.mazeBuilder.carve()

        return this.mazeBuilder.currentCell !== null
    }

    generate(): { grid: WalledGrid, maze: Path, rooms: Room[] } {
        this.start()
        while (this.step()) { }
        return this.bake()
    }

    public bake(factor: number = 2) {
        const { grid, maze } = this.mazeBuilder.scaleMaze()
        const rooms = this.roomBuilder.scaleTo(grid, factor)

        this.connector = new GridConnector(grid, rooms)
        this.pruner = new GridPruner(grid)

        this.connector.collapseConnectors()
        const pruner = this.pruner.pruneAll(250)

        for (const cell of pruner.prunedCells) {
            maze.removeCell(cell)
        }

        return { grid, maze, rooms }
    }
}