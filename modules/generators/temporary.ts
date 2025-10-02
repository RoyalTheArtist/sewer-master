
import { Resources } from '../../bt-engine/assets/loader';
import { Sprite } from '@engine/render/graphics/sprite';
import { Color } from '@engine/utils';
import { Vector2D } from '@engine/utils';
import { Surface } from '@engine/render/surface';
import { Cell, Grid } from './grid';
import { Region, RegionCell, RegionRect } from './region';
import { Path, Room } from './builders';
import { SpriteSheet } from '@engine/render/graphics/spritesheet';

// Future self: pulled this out of the dungeon experiment to get the Forest Map generation working for Tiny Quest
// Some is just temporary because I didn't want to deal with the existing types

export type AppearanceData = {
    graphic: {
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
    appearanceLibrary.set("blank", { appearance: blankAppearance, graphicsData: { graphic: { resource: "", size: [0, 0], location: [0, 0] } } })
    for (const [name, data] of Object.entries(appearanceData)) {
        if (!appearanceLibrary.has(name)) {
            const appearance = new Appearance(name)
            appearanceLibrary.set(name, { appearance, graphicsData: data })
            if (data.graphic.resource) {
                Resources.loadSpritesheet(data.graphic.resource)
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
        const spritesheet = Resources.loadSpritesheet(data.graphic.resource)
        const sprite = spritesheet?.getSprite(new Vector2D(data.graphic.location[0], data.graphic.location[1]), new Vector2D(data.graphic.size[0], data.graphic.size[1]))
        const graphic = new AppearanceGraphic(0, 0, 16, 16, sprite)
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

    setPosition(x: number, y: number) {
        this.position.x = x
        this.position.y = y
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



export class AppearanceGraphic extends GraphicsObject {
    sprite: Sprite
    lookslike: string = "blank"
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
    graphic?: AppearanceGraphic
    constructor(public lookslike: string) { }

    init() {
        if (!this.graphic) {
            const appearance = appearanceLibrary.get(this.lookslike)
            if (!appearance) return
            const graphic = getAppearanceGraphic(appearance.graphicsData)
            this.graphic = graphic
        }

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

    changeAppearance(lookslike: string) {
        this.lookslike = lookslike

        const appearance = appearanceLibrary.get(lookslike)
        if (!appearance) return
        const graphic = getAppearanceGraphic(appearance.graphicsData)
        this.graphic.sprite = graphic.sprite
    }
}

