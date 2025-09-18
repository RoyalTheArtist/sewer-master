import { Path, Room, WalledCell, WalledGrid } from '@modules/generators/builders';
import { CanvasViewport } from '@engine/render/viewport';
import { RoomsAndMazesBuilder } from '@modules/generators/roomsAndMazes';
import { Appearance, AppearanceData, ColorGraphics, getAppearance, getAppearanceGraphic, TinyMap, TinyTile } from "./temporary"
import { Color } from '@engine/utils/color';
import { Vector2D } from '@engine/utils';

export interface MapGenerator {
    width: number
    height: number
    generate(): TinyMap
}

export class ForestMapGenerator implements MapGenerator {
    map: TinyMap | undefined
    gridGenerator: RoomsAndMazesBuilder
    _viewport: CanvasViewport | undefined

    deadEnds: WalledCell[] = []
    pruneAmounts: number = 10

    connectors: WalledCell[] = []

    public get viewport(): CanvasViewport {
        if (!this._viewport) this.init()
        if (!this._viewport) throw new Error("Viewport initialization failed when accessing viewport")
        return this._viewport
    }
    constructor(public width: number, public height: number, public cellSize: number = 5) {
        this.gridGenerator = new RoomsAndMazesBuilder(width / 2, height / 2)
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
        return this.build(grid, maze, rooms)
    }

    public build(grid: WalledGrid, maze: Path, rooms: Room[]) {
        const blankTile = new TinyTile(0, 0, false, false)
        const appearanceInfo = getAppearance("blank")
        const graphic = new ColorGraphics(0, 0, 16, 16, Color.fromString("black"))
        blankTile.appearance = appearanceInfo?.appearance
        blankTile.appearance.graphic = graphic
        blankTile.appearance?.init()
        const tinyMap = new TinyMap(this.width, this.height)
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
                const appearanceData = getAppearance("dirt")!
                tile.appearance = appearanceData.appearance.copy()
                if (tile.appearance) {
                    tile.appearance.graphic = getAppearanceGraphic(appearanceData.graphicsData)
                    tile.appearance.init()
                }
            })
        }
        this.setMap(tinyMap.init())
        return tinyMap
    }


    // Migrated these from dungeon builder
    // should be its own module in the grid building pipeline
    // public identifyDeadEnds(maze: Path) {
    //     this.deadEnds = []

    //     for (const cell of this.maze.getCells()) {
    //         if (cell.isWalkable() === false) continue
    //         const walls = []

    //         for (const direction of DIRECTIONS_CARDINAL) {
    //             const neighborCell = this.grid.getCell(cell.x + direction[0], cell.y + direction[1])
    //             if (neighborCell && neighborCell.isWalkable() === false) {
    //                 walls.push(neighborCell)
    //             }
    //         }

    //         // if it's surrounded on three sides, it's a dead end
    //         if (walls.length === 3) {
    //             this.deadEnds.push(cell)
    //         }

    //         if (walls.length <= 2) {
                
    //             const walkableNeighbors = []

    //             for (const direction of DIRECTIONS_CARDINAL) {
    //                 const neighborCell = this.dungeon.grid.getCell(cell.x + direction[0], cell.y + direction[1])
    //                 if (neighborCell?.isWalkable()) {
    //                     walkableNeighbors.push(neighborCell)
    //                 }
    //             }

    //             if (walkableNeighbors.length === 1) {
    //                 this.deadEnds.push(cell)
    //             }
    //         }
    //     }
    // }

    // public pruneDeadEnds() {
    //     this.identifyDeadEnds()
    //     for (const cell of this.deadEnds) {
    //         cell.setWalkable(false)
    //         this.maze.removeCell(cell)
    //         cell.color = Color.fromString("black")
    //         cell.walls = [false, false, false, false]
    //     }
    // }

    // public pruneAll(until: number = 100) {
    //     this.identifyDeadEnds()
    //     while (this.deadEnds.length > 0 && until-- > 0) {
    //         this.pruneDeadEnds()
    //         this.identifyDeadEnds()
    //     }
    // }

    // public collapseConnectors() {
    //     this.connectors = findConnectors(this.grid)

    //     while(this.connectors.length > 0) {
    //         const connector = this.connectors.pop()

    //         if (!connector) return
    //         for (const direction of DIRECTIONS_CARDINAL) {
    //             const neighborCell = this.grid.getCell(connector.x + direction[0], connector.y + direction[1])
                
    //             try { 
    //             const room = this.grid.getRoom(neighborCell.x, neighborCell.y)

    //             if (room) {
    //                 room.addExit(connector)
    //                 this.connectors.splice(this.connectors.indexOf(connector), 1)
                    
    //                 this.pruneConnectors(room)
    //             }
    //             } catch (e) {
    //                 console.error(e)
    //                 throw e
    //             }
    //         }
    //     }
    // }

    // public pruneConnectors(room: Room) {
    //     const touchingConnectors = this.connectors.filter(connector => {
    //         for (const direction of DIRECTIONS_CARDINAL) {
    //             const neighborCell = this.dungeon.grid.getCell(connector.x + direction[0], connector.y + direction[1])
                
    //             if (neighborCell?.region === room) {
    //                 return true
    //             }
    //         }
    //     })

    //     for (const connector of touchingConnectors) {
    //         if (Math.random() * 200 < 2) room.addExit(connector)
    //         this.connectors.splice(this.connectors.indexOf(connector), 1)
    //     }
    // }

    draw() {
        this.viewport.surface.drawRect(new Vector2D(0, 0), new Vector2D(this.viewport.surface.width, this.viewport.surface.height), Color.fromString("black"))
        if (this.map) {
            this.map.draw(this.viewport.surface)
        }
        return this
    }
}