
import { TileSet } from '@modules/tiles/tile.tileset';
import { AssetLoader } from './loader';

class ResourceAsset {
    loaded: boolean = false
}

export class AssetManager {
    private _tilesets: Map<string, TileSet>

    public loadTileset = async (resource: string): Tileset => { 
        const tileSet = await AssetLoader.loadTileSet(resource)
        //this._tilesets.set(resource, tileSet)
    }
    
    constructor() {
        this._tilesets = new Map<string, TileSet>()
    }
}

