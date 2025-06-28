import { Texture } from "@engine/graphics/resources/texture"
import { Tile } from "../modules/tiles"


const allTileSets = new Map<string, TileSet>()
const allSpritesheets = new Map<string, SpriteSheet>()

export async function loadTileSet(tiles: TileSetData) {
    if (allTileSets.has(tiles.meta.resource)) {
        return allTileSets.get(tiles.meta.resource)
    }

    const sheet = await loadSpritesheet(tiles.spritesheet as SpriteSheetData)
    if (!sheet) throw new Error('Sheet not found')
    
    const tileSet = new TileSet(sheet, tiles.meta)
    for (const key in tiles.tiles) {
        tileSet.addTile(key, tiles.tiles[key])
    }
    allTileSets.set(tiles.meta.resource, tileSet)
    return tileSet
}
  
async function loadTexture(url: string) {
    const texture = new Texture(url)
    await texture.load()
    return texture
}

interface SpriteSheetData {
    resource: string,
    atlas: SpriteAtlas
}

async function loadSpritesheet(spritesheet: SpriteSheetData) {
    if (allSpritesheets.has(spritesheet.resource)) {
        return allSpritesheets.get(spritesheet.resource)
    }

    const texture = await loadTexture(spritesheet.resource)
    const sheet = new SpriteSheet(texture, spritesheet.atlas)
    sheet.process()
    allSpritesheets.set(spritesheet.resource, sheet)
    return sheet
}

export type TileSetAtlas = Record<string, TileSetData>
type TileSetMeta = {
    tilesize: {
        width: number;
        height: number;
    },
    resource: string
}
export interface TileSetData {
    spritesheet?: string | SpriteSheetData,
    meta: TileSetMeta,
    atlas?: SpriteAtlas,
    tiles: Record<string, Tile>
}

type DimensionRect = [number, number, number, number]

type SpriteAtlas = Record<string, DimensionRect | string>

class SpriteSheet {
    private _texture: Texture
    private _atlas: SpriteAtlas
    private _sprites: Map<string, HTMLImageElement> = new Map()
    constructor(texture: Texture, atlas: SpriteAtlas) {
        this._texture = texture
        this._atlas = atlas
    }

    process() {
        for (const [key, value] of Object.entries(this._atlas)) {
            if (typeof value === "string") {
                continue
            } else {
                const canvas = document.createElement('canvas')

                const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

                const [x, y, w, h] = value

                canvas.width = w
                canvas.height = h

                ctx.drawImage(this._texture.image as HTMLImageElement, x, y, w, h, 0, 0, w, h)
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


