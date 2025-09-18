
import { Resources } from './../assets/loader';
import { Sprite } from '@engine/render/graphics/sprite';
import { Color } from '@engine/utils';
import { Vector2D } from '@engine/utils';
import { Surface } from '@engine/render/surface';
import { Cell, Grid } from './grid';

// Future self: pulled this out of the dungeon experiment to get the Forest Map generation working for Tiny Quest
// Some is just temporary because I didn't want to deal with the existing types

export type AppearanceData = {
    graphics: {
        resource: string
        size: [number, number]
        location: [number, number]
    }
}

export type TilesetData = {
    meta: {}
    appearances: Record<string, AppearanceData>
}


export const appearanceLibrary = new Map<string, {
    appearance: Appearance,
    graphicsData: AppearanceData
}>()

export function createAppearances(appearanceData: Record<string, AppearanceData>) {
    const blankAppearance = new Appearance("blank")
    appearanceLibrary.set("blank", { appearance: blankAppearance, graphicsData: { graphics: { resource: "", size: [0, 0], location: [0, 0] } } })
    for (const [name, data] of Object.entries(appearanceData)) {
        if (!appearanceLibrary.has(name)) {
            const appearance = new Appearance(name)
            appearanceLibrary.set(name, { appearance, graphicsData: data })
            if (data.graphics.resource) {
                Resources.loadSpritesheet(data.graphics.resource)
            }
        }
    }
}

export function getAppearance(name: string): { appearance: Appearance, graphicsData: AppearanceData } {
    if (appearanceLibrary.has(name)) {
        return appearanceLibrary.get(name) as { appearance: Appearance, graphicsData: AppearanceData }
    }
    return appearanceLibrary.get("blank") as { appearance: Appearance, graphicsData: AppearanceData }
}


    export function getAppearanceGraphic(data: AppearanceData) {
        const spritesheet = Resources.loadSpritesheet(data.graphics.resource)
        const sprite = spritesheet?.getSprite(new Vector2D(data.graphics.location[0], data.graphics.location[1]), new Vector2D(data.graphics.size[0], data.graphics.size[1]))
        const graphic = new AppearanceGraphics(0, 0, 16, 16, sprite)
        return graphic
    }

export class GraphicsObject {
    position: Vector2D = new Vector2D(0, 0)
    dimensions: Vector2D = new Vector2D(0, 0)
   
    constructor(x: number, y: number, width: number, height: number) {
        this.position.x = x
        this.position.y = y
        this.dimensions.x = width
        this.dimensions.y = height
        
    }

    draw(surface: Surface) { 
        surface.drawRect(this.position, this.dimensions, Color.fromString("magenta"))
     }
}

export class ColorGraphics extends GraphicsObject {
    color: Color
    constructor(x: number, y: number, width: number, height: number, color: Color = Color.fromString("black")) {
        super(x, y, width, height)
        
        this.color = color
    }

    draw(surface: Surface) {
        surface.drawRect(this.position, this.dimensions, this.color)
    }
}



export class AppearanceGraphics extends GraphicsObject {
    sprite: Sprite
    constructor(x: number, y: number, width: number, height: number, sprite: Sprite) {
        super(x, y, width, height)
        this.sprite = sprite
    }

    draw(surface: Surface) {
        surface.context.save()
        surface.context.translate(this.position.x, this.position.y)
        //this.sprite.position = this.position
        this.sprite.render(surface)
        surface.context.restore()
    }
}


export class Appearance {
    parent: TinyTile | undefined
    graphic?: GraphicsObject
    constructor(public lookslike: string) { }

    init() {
        if (this.parent && this.graphic) {
            this.graphic.position.x = this.parent.x * 16
            this.graphic.position.y = this.parent.y * 16
            return this
        }
        //this.graphic = new ColorGraphics(0, 0, 16, 16)
        return this
    }

    copy() {
        const appearance = new Appearance(this.lookslike)
        appearance.parent = this.parent
        return appearance.init()
    }
}

export class TinyTile extends Cell {
    passable: boolean = false
    transparent: boolean = false
    appearance?: Appearance
    constructor(x: number, y: number, passable?: boolean, transparent?: boolean, appearance?: Appearance) {
        super(x, y)
        this.passable = passable || false
        this.transparent = transparent || false
        this.appearance = appearance
    }

    copy(x: number = this.x, y: number = this.y): TinyTile {
        const copyAppearance = new Appearance(this.appearance?.lookslike || "blank")
        const copyTile = new TinyTile(x, y, this.passable, this.transparent, copyAppearance)
        copyAppearance.parent = copyTile
        return new TinyTile(x, y, this.passable, this.transparent, new Appearance(this.appearance?.lookslike || ""))
    }

    init() {
        if (this.appearance) {
            this.appearance.parent = this
            this.appearance.init()
        }
        return this
    }
}

export class TileGrid extends Grid<TinyTile> {}


export class TinyMap {
    tiles: TileGrid
    appearances: Appearance[] = []
    constructor(width: number, height: number) {
        this.tiles = new TileGrid(width, height)
    }

    public fill(fill: (x: number, y: number) => TinyTile) {
        this.tiles.fill(fill)
        return this
    }

    draw(surface: Surface) {
        for (let appearance of this.appearances) {
            appearance.graphic?.draw(surface)
        }
    }

    init() {
        this.appearances = []
        for (let tile of this.tiles.cells.flat()) {
            tile.init()
            if (tile.appearance && tile.appearance.graphic) {
                this.appearances.push(tile.appearance)
                
            }
        }
        return this
    }
}