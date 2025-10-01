
import { Color } from "@engine/utils/color"
import { Path, Room, WalledGrid } from "./builders"
import { ColorGraphics, getAppearance, getAppearanceGraphic, TinyMap, TinyTile } from "./temporary"

export const DIRECTIONS_CARDINAL = [[0, -1], [1, 0], [0, 1], [-1, 0]]

export const mapFromGrid = (grid: WalledGrid, rooms: Room[], maze: Path): TinyMap => {
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