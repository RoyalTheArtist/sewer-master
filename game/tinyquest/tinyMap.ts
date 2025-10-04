import { Path, Room } from '@modules/generators/builders';
import { TinyTile, TTile } from './tiles';
import { Grid } from '@modules/generators/grid';
import { Region, RegionRect } from '@modules/generators/region';
import { Vector2D } from '@engine/utils/vectors';

abstract class BaseMap<T extends TTile> {
    readonly tiles: T[] = []
    readonly width: number
    readonly height: number
    constructor(width: number, height: number) { 
        this.width = width
        this.height = height
    }

    abstract fill(fill: (x: number, y: number) => T): this
    public getTile(x: number, y: number) {
        return this.tiles[y * this.width + x]
    }
}

class TinyPath extends Region<TinyTile> {
    constructor(grid: Grid<TinyTile>) {
        super(grid)
    }
}

export class TinyRoom extends RegionRect<TinyTile> {
    _center: Vector2D
    constructor(grid: Grid<TinyTile>, public x: number, public y: number, public width: number, public height: number) {
        super(grid)
        this._center = new Vector2D(this.x + Math.floor( this.width / 2), this.y + Math.floor(this.height / 2))
    }

    get center(): Vector2D {
        return this._center
    }
}


export class TileGrid extends Grid<TinyTile> {}

export class TinyMap {
    tiles: TileGrid
    rooms: TinyRoom[] = []
    path: TinyPath | null = null

    constructor(width: number, height: number) {
        this.tiles = new TileGrid(width, height)
    }

    public fill(fill: (x: number, y: number) => TinyTile) {
        this.tiles.fill(fill)
        return this
    }

    init() {
        return this
    }

    addRoom(x: number, y: number, width: number, height: number, tiles: TinyTile[]) {
        const tinyRoom = new TinyRoom(this.tiles, x, y, width, height)
        this.rooms.push(tinyRoom)
        for (const tile of tiles) {
            tinyRoom.addCell(tile)
        }
    }
    
    addToPath(cell: TinyTile) {
        if (!this.path) this.path = new TinyPath(this.tiles)
        this.path.addCell(cell)
    }

    addFullPath(path: Path) {
        if (!this.path) this.path = new TinyPath(this.tiles)
        for (let cell of path.getCells()) {
            const tile = this.tiles.getCell(cell.x, cell.y)!
            this.path.addCell(tile)
        }
    }

    isWalkable(x: number, y: number) {
        const cell = this.tiles.getCell(x, y)
        if (!cell) return false
        return this.tiles.isWithinBounds(x, y) && cell.passable 
    }
}