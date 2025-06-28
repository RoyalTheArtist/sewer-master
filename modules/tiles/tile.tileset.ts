import { ISpriteSheetData, SpriteSheet } from "@engine/graphics";
import { IInitialize } from "@engine";
import { Tile } from ".";

export interface ITileSetData {
    "meta": ITileSetMeta,
    "tiles": Record<string, Tile>
}


export interface ITileSetMeta {
    "size": [number, number],
    "spritesheet": string
}

export interface ITileSetManifest {
    "tileset": ITileSetData,
    "spritesheet": ISpriteSheetData
}


export class TileSet implements IInitialize {
    private _spritesheet: SpriteSheet
    private _tiles: Map<string, Tile> = new Map()
    private _meta: ITileSetMeta
    private _tileDefinition: Record<string, Tile> = {}
    // public static fromManifest(tiledata: ITileSetManifest) {
    //     if (tiledata.spritesheet) {
    //         const spritesheet = SpriteSheet.from(tiledata.spritesheet).setAtlas(tiledata.spritesheet.atlas)
    //     } 
    // }
    
    public get meta() {
        return this._meta
    }

    constructor(tileData: ITileSetData, spritesheet: SpriteSheet) {
        this._spritesheet = spritesheet
        this._meta = tileData.meta
        this._tileDefinition = tileData.tiles
    }

    public get spritesheet() {
        return this._spritesheet
    }  
    public initialize() {
        for (const [name, tile] of Object.entries(this._tileDefinition)) {
        
            this._tiles.set(name, tile)
        }
    }


}

export class TileSetManager {
    private static _tilesets: Map<string, TileSet> = new Map()

    public static getTileset(name: string): TileSet | undefined {
        return this._tilesets.get(name)
    }

    public static addTileSet(name: string, tileset: TileSet) {
        this._tilesets.set(name, tileset)
    }

    public static build(_name: string, _data: ITileSetData) {
        // const spriteSheet = SpriteSheet.from(data.meta.spritesheet)
        // const tileset = new TileSet()
        // this.addTileSet(name, tileset)
    }
}