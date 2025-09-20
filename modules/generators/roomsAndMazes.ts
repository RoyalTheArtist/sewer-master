import { GridBuilder, MazeBuilder, Path, Room, RoomBuilder, WalledGrid } from './builders';
export type RoomsAndMazesOptions = {
    maxRoomAttempts?: number
    minRoomSize?: number
    maxRoomSize?: number
    pruneAmount?: number
}

export class RoomsAndMazesBuilder extends GridBuilder {
    roomBuilder: RoomBuilder
    mazeBuilder: MazeBuilder
    constructor(width: number, height: number, options?: RoomsAndMazesOptions) {
        super(width, height)
        this.roomBuilder = new RoomBuilder(this.grid, options?.maxRoomAttempts, options?.minRoomSize, options?.maxRoomSize)
        this.mazeBuilder = new MazeBuilder(this.grid)
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

        return { grid, maze, rooms }
    }
}