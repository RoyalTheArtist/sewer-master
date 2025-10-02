import { Vector2D } from "@engine/utils/vectors"
import { RegionCell } from "@modules/generators/region"

export type Appearance = {
    lookslike: string
}

export type TTile = {
    name: string
    passable: boolean
    transparent: boolean
    appearance: Appearance
}


export class TinyTile extends RegionCell implements TTile {
    constructor(public name: string, public passable: boolean, public appearance: Appearance, public transparent: boolean, x: number = 0, y: number = 0) {
        super(x, y)
    }

    copy(x?: number, y?: number): TinyTile {
        return new TinyTile(this.name, this.passable, { ...this.appearance }, this.transparent, x || this.position.x, y || this.position.y)
    }

    changeAppearance(string: string) {
        this.appearance.lookslike = string
    }
}

export class Tileset {
    tiles: Map<string, TinyTile> = new Map()
    blankTile: TinyTile = new TinyTile("blank", true, { lookslike: "blank" }, false)

    public addTile(name: string, tile: TTile): TinyTile { 
        if (this.tiles.has(name)) return this.tiles.get(name) as TinyTile
        const newTile = new TinyTile(name, tile.passable, tile.appearance, tile.transparent)
        this.tiles.set(name, newTile)
        return newTile
    }

    public getTile(name: string): TinyTile {
        return this.tiles.get(name)?.copy() || this.blankTile.copy()
    }
}