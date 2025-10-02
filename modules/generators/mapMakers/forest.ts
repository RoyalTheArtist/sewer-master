import { PeacefulPondEncounter } from '../encounters/peacefulPond';
import { CampsiteEncounter } from '../encounters/campsite';
import { Path, Room, WalledCell, WalledGrid } from '@modules/generators/builders';
import { RoomsAndMazesBuilder } from '@modules/generators/roomsAndMazes';
//import { mapFromGrid } from '../utils';
import { MapGenerator } from '../mapGenerator'
import { TTile, Tileset, TinyTile } from '@/tinyquest/tiles';
import { TinyMap, TinyRoom } from '@/tinyquest/tinyMap'


const mapFromGrid = (grid: WalledGrid, rooms: Room[], maze: Path, tileset: Tileset): TinyMap => {
    const tinyMap = new TinyMap(grid.width, grid.height)
    tinyMap.fill((x: number, y: number) => {
        const copy = tileset.getTile("tree").copy()
        copy.setPosition(x, y)
        return copy
    })

    for (const cell of maze.getCells()) {
        const tile = tileset.getTile("path")
        tinyMap.tiles.setCell(cell.x, cell.y, tile)
        tinyMap.addToPath(tile)
    }

    for (const room of rooms) {
        const roomTiles = []

        for (let i = room.x; i < room.x + room.width; i++) {
            for (let j = room.y; j < room.y + room.height; j++) {
                const tile = tileset.getTile("grass")
                tinyMap.tiles.setCell(i, j, tile)
                roomTiles.push(tile)
            }
        }

        room.exits.forEach(exit => {
            const tile = tileset.getTile("path")
            tinyMap.tiles.setCell(exit.x, exit.y, tile)
            roomTiles.push(tile)
        })

        tinyMap.addRoom(room.x, room.y, room.width, room.height, roomTiles)
    }
    
    
    return tinyMap.init()
}

export class ForestGenerator implements MapGenerator {
    tileset: Tileset = new Tileset()
    map: TinyMap | undefined
    gridGenerator: RoomsAndMazesBuilder
    pruneAmounts: number = 250

    connectors: WalledCell[] = []

    startingRoom: TinyRoom | undefined
    largestRoom: TinyRoom | undefined
    smallestRoom: TinyRoom | undefined
    public startingTile: TinyTile | undefined

    constructor(public width: number, public height: number) {
        this.gridGenerator = new RoomsAndMazesBuilder(width / 2, height / 2, {
            maxRoomAttempts: 30,
            maxRoomSize: 5
        })
    }

    start() {

    }

    step() {

    }

    public createTileset(tiles: TTile[]) {
        for (const tile of tiles) {
            this.tileset.addTile(tile.name, tile)
        }
    }

    public generate() {
        const { grid, maze, rooms } = this.gridGenerator.generate()

        const map = mapFromGrid(grid, rooms, maze, this.tileset)
        this.map = map.init()

        this.pruneTrees()
        this.wearPath()
        this.wearPath()
        this.setEncounters(this.map)
       
        return this
    }

    public findStartingRoom(rooms: TinyRoom[]) {
        for (const room of rooms) {
            if (!this.startingRoom) this.startingRoom = room

            if (room.area < this.startingRoom.area) this.startingRoom = room
        }
    }

    public setEncounters(map: TinyMap) {
        this.findSmallestRoom(map.rooms)
        this.findLargestRoom(map.rooms)

        this.buildPond()
        this.buildCampsite()
    }

    public buildPond() {
        if (!this.largestRoom) return

        const encounter = new PeacefulPondEncounter(this.largestRoom)
        encounter.place(this.map!)
    }

    public buildCampsite() {
        if (!this.smallestRoom) return

        const campSite = new CampsiteEncounter(this.smallestRoom)
        campSite.place(this.map!)

        const roomCenter = this.smallestRoom.center
        this.startingTile = this.map!.tiles.getCell(roomCenter.x - 1, roomCenter.y)
    }

    public findLargestRoom(rooms: TinyRoom[]) {
        for (const room of rooms) {
            if (!this.largestRoom) this.largestRoom = room

            if (room.area > this.largestRoom.area) this.largestRoom = room
        }
    }

    public findSmallestRoom(rooms: TinyRoom[]) {
        for (const room of rooms) {
            if (!this.smallestRoom) this.smallestRoom = room

            if (room.area < this.smallestRoom.area) this.smallestRoom = room
        }

        return 
    }   

    public pruneTrees() {
        if (!this.map?.path) return
        const treesTouchingMaze = []
        const cardinalDirections = [[0, 1], [1, 0]] as number[][];
        const removedTrees: TinyTile[] = []
        
        // clean up the trees for a little more room around the path

        for (const cell of this.map?.path?.getCells()) {
            for (const direction of cardinalDirections) {
                const neighborCell = this.map?.tiles.getCell(cell.x + direction[0], cell.y + direction[1]) as TinyTile;
                const secondNeighbor = this.map?.tiles.getCell(cell.x + direction[0] * -1, cell.y + direction[1] * -1) as TinyTile;
                if (neighborCell.appearance?.lookslike === "tree") {
                    treesTouchingMaze.push(neighborCell)
                }

                if (secondNeighbor?.appearance?.lookslike === "tree") {
                    treesTouchingMaze.push(secondNeighbor)
                }
            }
        }

        for (const tree of treesTouchingMaze) {
            const removeTree = Math.random() <= 0.3
            if (!removeTree) continue
            const grass = this.tileset.getTile("grass")
            grass.changeAppearance("shortgrass")
            this.map.tiles.setCell(tree.x, tree.y, grass)
            removedTrees.push(tree)
        }
        

        // clean up the trees for a little more room around the rooms
        const treesTouchingRooms = []

        for (const room of this.map.rooms) {
            for (const cell of room.getBorders()) {
                for (const direction of cardinalDirections) {
                    const neighborCell = this.map?.tiles.getCell(cell.x + direction[0], cell.y + direction[1]) as TinyTile;
                    const secondNeighbor = this.map?.tiles.getCell(cell.x + direction[0] * -1, cell.y + direction[1] * -1) as TinyTile;
                    if (!neighborCell.passable) {
                        treesTouchingRooms.push(neighborCell)
                    }

                    if (secondNeighbor && !secondNeighbor.passable) {
                        treesTouchingRooms.push(secondNeighbor)
                    }
                }
            }
        }

        for (const tree of treesTouchingRooms) {
            const removeTree = Math.random() <= 0.35
            if (!removeTree) continue

            const grass = this.tileset.getTile("grass")
            this.map.tiles.setCell(tree.x, tree.y, grass)
            removedTrees.push(tree)
        }

        // finally lets make the trees a little less homogenous

        const remainingTrees = this.map?.tiles.cellsFlat.filter(tile => {
            return tile.name === "tree" && !removedTrees.includes(tile)
        })

        for (const tree of remainingTrees) {
            const treeFate = Math.random()
            
            if (treeFate < 0.12) {
                tree.changeAppearance("deadtree")
            }
            else if (treeFate < 0.27) {
                tree.changeAppearance("yellowtree")
            } else if (treeFate < 0.4) {
                tree.changeAppearance("doubletree")
            }
        
            removedTrees.push(tree)
        }
    }

    public wearPath() {
        if (!this.map?.path) return
        for (const cell of this.map?.path?.getCells()) {
            const wearTile = Math.random() <= 0.1
            if (!wearTile) continue
            const tile = this.map?.tiles.getCell(cell.x, cell.y) as TinyTile
            tile.changeAppearance("wornpath")
        }
    }

    public bake(): TinyMap {
        return this.map as TinyMap
    }
}