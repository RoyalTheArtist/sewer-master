
import { TileSet } from './../game/modules/tiles/tile.tileset';
import { AssetLoader } from './loader';

export class AssetManager {
    private _tilesets: Map<string, TileSet>
    public loadTileSetFrom = async (resource: string) => { 
        const tileSet = await AssetLoader.loadTileSet(resource)
        //this._tilesets.set(resource, tileSet)
    }
    
    constructor() {
        this._tilesets = new Map<string, TileSet>()
    }
}

