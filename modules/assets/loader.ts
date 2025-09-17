
import { SpriteSheet } from "@engine/render/graphics/spritesheet";
import { Texture } from "@engine/render/graphics/texture";

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
    atlas: Record<string, [number, number, number, number]>
  }
  tiles: Record<string, TileLoadData>
}

const spritesheets = new Map<string, SpriteSheet>()

// const response = await fetch('../../data/tilesets/forest-module.json')
// const tilesetData = await response.json()
export class AssetLoader {
    public static _baseUrl = '/'

    public static get baseUrl() {
        return this._baseUrl
    }

    public static set baseUrl(url: string) {
        this._baseUrl = url
  }

  async loadJson<T>(resource: string): Promise<T> {
    return await fetchJson<T>(resource)
  }
  
  loadSpritesheet(resource: string) {
        if (spritesheets.has(resource)) return spritesheets.get(resource)
        const texture = new Texture(resource)
    const spritesheet = new SpriteSheet(texture)
        spritesheets.set(resource, spritesheet)
        return spritesheet
  }
    // public static async loadSpritesheet(resource: string, atlas: Record<string, [number, number]>) {
    //     const spriteJSON = await fetchJson<ISpriteSheetData>(this.baseUrl + resource)
    //     if (!spriteJSON) throw new Error('Resource not found')
        
    //     const spritesheet = SpriteSheet.from(spriteJSON)
    //     this.spritesheets.set(resource, spritesheet)
    //     return spritesheet
    // }

    // public static async loadTileSet(resource: string) {
    //     const manifest = await fetchJson<TileSetLoadData>(this.baseUrl + resource)
    //     console.info(manifest)
    //     const spriteSheet = await AssetLoader.loadSpritesheet(manifest.spritesheet.resource)
    // }
}

export const Resources = new AssetLoader()