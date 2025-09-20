import { GridConnector, GridPruner, Path, Room, WalledCell, WalledGrid } from '@modules/generators/builders';
import { CanvasViewport } from '@engine/render/viewport';
import { RoomsAndMazesBuilder } from '@modules/generators/roomsAndMazes';
import { ColorGraphics, getAppearance, getAppearanceGraphic, TinyMap, TinyRoom, TinyTile } from "./temporary"
import { Color } from '@engine/utils/color';
import { Vector2D } from '@engine/utils';

export interface MapGenerator {
    width: number 
    height: number
    generate(): MapGenerator
}

const mapFromGrid = (grid: WalledGrid, rooms: Room[], maze: Path) => {
    const blankTile = new TinyTile(0, 0, false, false)
    const appearanceInfo = getAppearance("blank")
    const graphic = new ColorGraphics(0, 0, 16, 16, Color.fromString("black"))
    blankTile.appearance = appearanceInfo?.appearance
    blankTile.appearance.graphic = graphic
    blankTile.appearance?.init()
    const tinyMap = new TinyMap(grid.width, grid.height)
    tinyMap.fill((x, y) => {
        const copy = blankTile.copy(x, y)
        copy.appearance!.graphic = graphic
        copy.appearance?.init()
        copy.appearance!.parent = copy
        return copy
    })

    for (const cell of grid.cellsFlat) {
        if (!cell.isWalkable()) {
            const tile = tinyMap.tiles.getCell(cell.x, cell.y) as TinyTile
            tile.passable = false
            tile.transparent = false
            const appearanceData = getAppearance("tree")!
            tile.appearance = appearanceData.appearance.copy()


            if (tile.appearance) {
                tile.appearance.graphic = getAppearanceGraphic(appearanceData.graphicsData)
                tile.appearance.init()
            }
        }
    }

    for (const cell of maze.getCells()) {
        const tile = tinyMap.tiles.getCell(cell.x, cell.y) as TinyTile
        tile.passable = true
        tile.transparent = true
        const appearanceData = getAppearance("path")!
        tile.appearance = appearanceData.appearance.copy()
        if (tile.appearance) {
            tile.appearance.graphic = getAppearanceGraphic(appearanceData.graphicsData)
            tile.appearance.init()
        }
    }

    for (const room of rooms) {
        for (let i = room.x; i < room.x + room.width; i++) {
            for (let j = room.y; j < room.y + room.height; j++) {
                const tile = tinyMap.tiles.getCell(i, j) as TinyTile
                tile.passable = true
                tile.transparent = true
                const appearanceData = getAppearance("grass")!
                tile.appearance = appearanceData.appearance.copy()
                if (tile.appearance) {
                    tile.appearance.graphic = getAppearanceGraphic(appearanceData.graphicsData)
                    tile.appearance.init()
                }
            }
        }

        room.exits.forEach(exit => {
            const tile = tinyMap.tiles.getCell(exit.x, exit.y) as TinyTile
            tile.passable = true
            tile.transparent = true
            const appearanceData = getAppearance("path")!
            tile.appearance = appearanceData.appearance.copy()
            if (tile.appearance) {
                tile.appearance.graphic = getAppearanceGraphic(appearanceData.graphicsData)
                tile.appearance.init()
            }
        })

        tinyMap.addRoom(room)
      

    }
    
    
    tinyMap.addPath(maze)
    return tinyMap.init()
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
        this.findStartingRoom(map.rooms)
        this.findLargestRoom(map.rooms)
      
        this.prunePath()
        this.wearPath()
        this.wearPath()
        //this.wearPath()
          this.buildPond()
        return this
    }

    public findStartingRoom(rooms: TinyRoom[]) {
        for (const room of rooms) {
            if (!this.startingRoom) this.startingRoom = room

            if (room.area < this.startingRoom.area) this.startingRoom = room
        }
    }

    public buildPond() {
        if (!this.largestRoom) return

        // ponds leave a two tile border

        const pondWidth = this.largestRoom.width - 4
        const pondHeight = this.largestRoom.height - 4

        const pondX = this.largestRoom.x + 2
        const pondY = this.largestRoom.y + 2

        for (let x = pondX; x < pondX + pondWidth; x++) {
            for (let y = pondY; y < pondY + pondHeight; y++) {
                if (x === pondX && y === pondY
                    || x === pondX + pondWidth - 1 && y === pondY + pondHeight - 1
                    || x === pondX + pondWidth - 1 && y === pondY
                    || x === pondX && y === pondY + pondHeight - 1) continue
                const tile = this.map?.tiles.getCell(x, y) as TinyTile
                tile.passable = false
                tile.appearance?.changeAppearance("water")
            }
        }
    }

    public findLargestRoom(rooms: TinyRoom[]) {
        for (const room of rooms) {
            if (!this.largestRoom) this.largestRoom = room

            if (room.area > this.largestRoom.area) this.largestRoom = room
        }
    }

    public prunePath() {
        if (!this.map?.path) return
        const treesTouchingMaze = []
        const cardinalDirections = [[0, 1], [1, 0]] as number[][];
        const removedTrees: TinyTile[] = []
        
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
            const removeTree = Math.random() <= 0.4
            if (!removeTree) continue
            tree.passable = true
            if (tree.appearance) tree.appearance.changeAppearance("shortgrass")
            removedTrees.push(tree)
        }
        
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
            const removeTree = Math.random() <= 0.4
            if (!removeTree) continue
            tree.passable = true
            if (tree.appearance) tree.appearance.changeAppearance("grass")
            removedTrees.push(tree)
        }

        //const remainingTrees = [...treesTouchingMaze, ...treesTouchingRooms].filter(tree => !removedTrees.includes(tree))

        const remainingTrees = this.map?.tiles.cellsFlat.filter(tile => {
            return !tile.passable && !removedTrees.includes(tile)
        })

        for (const tree of remainingTrees) {
            const treeFate = Math.random()
            
            if (treeFate < 0.15) {
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

        // if (this.startingRoom) {
        //     const { position, dimensions } = this.startingRoom
        //     const startPos = new Vector2D(position.x * 16, position.y * 16)
        //     const scaledDimensions = new Vector2D(dimensions.x * 16, dimensions.y * 16)
        //     const green = Color.fromString("green")
        //     green.setAlpha(0.5)
        //     this.viewport.surface.drawRect(startPos, scaledDimensions, green)
        // }

        // if (this.largestRoom) {
        //     const { position, dimensions } = this.largestRoom
        //     const startPos = new Vector2D(position.x * 16, position.y * 16)
        //     const scaledDimensions = new Vector2D(dimensions.x * 16, dimensions.y * 16)
        //     const red = Color.fromString("magenta")
        //     red.setAlpha(0.5)
        //     this.viewport.surface.drawRect(startPos, scaledDimensions, red)
        // }

        return this
    }
}