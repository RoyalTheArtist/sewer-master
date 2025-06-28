
import { SpriteSheet } from "@engine/graphics";

async function fetchJson<T>(resource: string): Promise<T> { 
    try {
        const result = await fetch(resource)
        if (!result.ok) throw new Error('Resource not found')
        const data = await result.json()
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}

type TileLoadData = {
  "passable": boolean,
  "transparent": boolean,
  "sprite": [number, number]
}

type TileSetLoadData = {
  meta: {
    resource: string,
    size: [number, number]
  },
  spritesheet: {
    resource: string,
    atlas: Record<string, [number, number]>
  }
  tiles: Record<string, TileLoadData>
}

export class AssetLoader {
    public static _baseUrl = '/'

    public static get baseUrl() {
        return this._baseUrl
    }

    public static set baseUrl(url: string) {
        this._baseUrl = url
    }
    public static async loadSpritesheet(resource: string, atlas: Record<string, [number, number]>) {
        const spriteJSON = await fetchJson<ISpriteSheetData>(this.baseUrl + resource)
        if (!spriteJSON) throw new Error('Resource not found')
        
        const spritesheet = SpriteSheet.from(spriteJSON)
        this.spritesheets.set(resource, spritesheet)
        return spritesheet
    }

    public static async loadTileSet(resource: string) {
        const manifest = await fetchJson<TileSetLoadData>(this.baseUrl + resource)
        console.info(manifest)
        const spriteSheet = await AssetLoader.loadSpritesheet(manifest.spritesheet.resource)
    }
}