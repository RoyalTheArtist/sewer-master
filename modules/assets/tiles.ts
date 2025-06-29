import { Texture } from "@engine/graphics/resources/texture"
import { Tile } from "../tiles"
import { create } from "domain"


const allTileSets = new Map<string, TileSet>()
const allSpritesheets = new Map<string, SpriteSheet>()

export async function loadTileSet(tiles: TileSetData) {
    if (allTileSets.has(tiles.meta.name)) {
        return allTileSets.get(tiles.meta.name)
    }

    const sheet = await loadSpritesheet(tiles.spritesheet as SpriteSheetData)
    if (!sheet) throw new Error('Sheet not found')
    
    const tileSet = new TileSet(sheet, tiles.meta)
    for (const key in tiles.tiles) {
        tileSet.addTile(key, tiles.tiles[key])
    }
    allTileSets.set(tiles.meta.name, tileSet)
    return tileSet
}

export async function loadTileSetByDefinition(data: TileSetData) {
    const sheet = await loadSpritesheet(data.spritesheet as SpriteSheetData)
    if (!sheet) throw new Error('Sheet not found')
    
    const tileSet = createTileSet(sheet, data)
    return tileSet
}
  
const createTileSet = (sheet: SpriteSheet, data: TileSetData) => {
    const tileSet = new TileSet(sheet, data.meta)
    for (const key in data.tiles) {
        tileSet.addTile(key, data.tiles[key])
    }
    return tileSet
} 

async function loadTexture(url: string) {
    const texture = new Texture(url)
    await texture.load()
    return texture
}

interface SpriteSheetData {
    meta: {
        resource: string,
        size: [number, number]
    },
    atlas: SpriteAtlas
}

async function loadSpritesheet(spritesheet: SpriteSheetData) {
    if (allSpritesheets.has(spritesheet.meta.resource)) {
        return allSpritesheets.get(spritesheet.meta.resource)
    }

    const texture = await loadTexture(spritesheet.meta.resource)
    const sheet = new SpriteSheet(texture, spritesheet)
    sheet.process()
    allSpritesheets.set(spritesheet.meta.resource, sheet)
    return sheet
}

export type TileSetAtlas = Record<string, TileSetData>
type TileSetMeta = {
    name: string
}
export interface TileSetData {
    spritesheet?: string | SpriteSheetData,
    meta: TileSetMeta,
    tiles: Record<string, Tile>
}

type DimensionRect = [number, number, number, number]

type SpriteAtlas = Record<string, DimensionRect | string>

class SpriteSheet {
    private _texture: Texture
    private _atlas: SpriteAtlas
    private _sprites: Map<string, HTMLImageElement> = new Map()
    private size: [number, number]
    constructor(texture: Texture, data: SpriteSheetData) {
        this._texture = texture
        this._atlas = data.atlas
        this.size = data.meta.size
    }

    process() {
        for (const [key, value] of Object.entries(this._atlas)) {
            if (typeof value === "string") {
                continue
            } else {
                const canvas = document.createElement('canvas')

                const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

                const [x, y] = value

                const w = this.size[0]
                const h = this.size[1]

                canvas.width = w
                canvas.height = h

                ctx.drawImage(this._texture.image as HTMLImageElement, x * w, y * w, w, h, 0, 0, w, h)
                const img = new Image()
                img.src = canvas.toDataURL()
                this._sprites.set(key, img)
            }
        }
    }

    getSprite(name: string): HTMLImageElement | undefined {
        return this._sprites.get(name)
    }

    get texture() {
        return this._texture
    }
}

export class TileSet {
    private _spritesheet: SpriteSheet
    private meta: TileSetMeta
    tiles: Map<string, Tile> = new Map()

    constructor(spritesheet: SpriteSheet, meta: TileSetMeta) {
        this._spritesheet = spritesheet
        this.meta = meta
    }   

    get spritesheet() {
        return this._spritesheet
    }

    get tileWidth() {
        return this.meta.tilesize.width
    }

    get tileHeight() {
        return this.meta.tilesize.height
    }

    get resource() {
        return this.meta.resource
    }

    public addTile(key: string, tile: Tile) {
        this.tiles.set(key, tile)
    }

    public getTile(name: string): Tile | undefined {
        return this.tiles.get(name)
    }

    getTileImage(name: string): HTMLImageElement | undefined {
        return this._spritesheet.getSprite(name)
    }

    public get iter(): IterableIterator<Tile> {
        return this.tiles.values()
    }
}


