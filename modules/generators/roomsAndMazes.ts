import { GridBuilder, MazeBuilder, Path, Room, RoomBuilder, WalledGrid } from './builders';
export type RoomsAndMazesOptions = {
    maxRoomAttempts?: number
    minRoomSize?: number
    maxRoomSize?: number
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

        const rooms: Room[] = []
        for (const room of this.roomBuilder.rooms) {
            const newRoom = new Room(room.x * factor, room.y * factor, room.width * factor - 1, room.height * factor - 1, room.color)
            rooms.push(newRoom)
        }

        return { grid, maze, rooms }
    }
}