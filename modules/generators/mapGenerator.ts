import { PeacefulPondEncounter } from './encounters/peacefulPond';
import { CampsiteEncounter } from './encounters/campsite';
import { GridConnector, GridPruner, WalledCell } from '@modules/generators/builders';
import { CanvasViewport } from '@engine/render/viewport';
import { RoomsAndMazesBuilder } from '@modules/generators/roomsAndMazes';
import { TinyMap, TinyRoom, TinyTile } from "./temporary"
import { Color } from '@engine/utils/color';
import { Vector2D } from '@engine/utils';
import { mapFromGrid } from './utils';

export interface MapGenerator {
    width: number 
    height: number
    generate(): MapGenerator
}





export class ForestMapGenerator implements MapGenerator {
    map: TinyMap | undefined
    gridGenerator: RoomsAndMazesBuilder
    _viewport: CanvasViewport | undefined
    backgroundColor: Color = new Color(26, 11, 18, 1) //new Color(32,24,52, 1)

    deadEnds: WalledCell[] = []
    pruneAmounts: number = 250

    connectors: WalledCell[] = []

    startingRoom: TinyRoom | undefined
    largestRoom: TinyRoom | undefined
    smallestRoom: TinyRoom | undefined

    public get viewport(): CanvasViewport {
        if (!this._viewport) this.init()
        if (!this._viewport) throw new Error("Viewport initialization failed when accessing viewport")
        return this._viewport
    }
    constructor(public width: number, public height: number, public cellSize: number = 5) {
        this.gridGenerator = new RoomsAndMazesBuilder(width / 2, height / 2, {
            maxRoomAttempts: 30,
            maxRoomSize: 5
        })
    }

    init() {
        this._viewport = CanvasViewport.createViewport(this.width  * this.cellSize, this.height * this.cellSize).attachTo("forest-map")
        return this
    }

    setMap(map: TinyMap) {
        this.map = map
        return this
    }

    start() {

    }

    step() {

    }

    public generate() {
        const { grid, maze, rooms } = this.gridGenerator.generate()
        new GridConnector(grid, rooms).collapseConnectors()
        const pruner = new GridPruner(grid).pruneAll(this.pruneAmounts)

        for (const cell of pruner.prunedCells) {
            maze.removeCell(cell)
        }

        const map = mapFromGrid(grid, rooms, maze)
        this.setMap(map.init()) 
      
        this.prunePath()
        this.wearPath()
        this.wearPath()
        this.setEncounters(map)
       
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

    public prunePath() {
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
            tree.passable = true
            if (tree.appearance) tree.appearance.changeAppearance("shortgrass")
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
            tree.passable = true
            if (tree.appearance) tree.appearance.changeAppearance("grass")
            removedTrees.push(tree)
        }

        // finally lets make the trees a little less homogenous

        const remainingTrees = this.map?.tiles.cellsFlat.filter(tile => {
            return !tile.passable && !removedTrees.includes(tile)
        })

        for (const tree of remainingTrees) {
            const treeFate = Math.random()
            
            if (treeFate < 0.12) {
                tree.passable = false
                tree.appearance?.changeAppearance("deadtree")
            }
            else if (treeFate < 0.27) {
                tree.passable = false
                tree.appearance?.changeAppearance("yellowtree")
            } else if (treeFate < 0.4) {
                 tree.passable = false
                tree.appearance?.changeAppearance("doubletree")
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
            tile.appearance?.changeAppearance("wornpath")
        }
    }

    draw() {
        this.viewport.surface.drawRect(new Vector2D(0, 0), new Vector2D(this.viewport.surface.width, this.viewport.surface.height),this.backgroundColor)
        if (this.map) {
            this.map.draw(this.viewport.surface)
        }

        return this
    }
}