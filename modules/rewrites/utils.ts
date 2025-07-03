import { Vector2D } from "@engine/utils"
import { GameMapRW as GameMap, type MapGenerationData } from "./map"
import { Tile, TileMap, TileSet, TileSprite, type TileData, type TilesetData } from "./tiles/tile"
import { Texture } from "@engine/render/graphics/texture"
import { SpriteSheet } from "@engine/render/graphics/sprite"

const BLANK_TILE: TileData = {
    name: 'blank',
    passable: true,
    transparent: true,
    appearance: undefined
}

export async function generateTerrain(terrain: { tileset: TilesetData, layout: number[] }): Promise<{ tileMap: TileMap | undefined, tiles: Tile[] }> {
    const tileset = new TileSet(terrain.tileset).initialize()
    const tileMap = await makeTileMap(tileset, terrain.tileset.tilemap.resource, terrain.tileset.tilemap.size, terrain.tileset.tilemap.atlas)
    const tiles = tileset.generateTileLayout(terrain.layout)
    //const tiles = tileMap.getMapSprites(layout, )
    return { tileMap, tiles }
}

export async function generateMap(mapData: MapGenerationData) {
    const size = new Vector2D(mapData.meta.size[0], mapData.meta.size[1])

    const terrain = await generateTerrain(mapData.terrain)
    const map = new GameMap(mapData.meta.name, size, terrain.tileMap)
    map.setTiles(terrain.tiles)
    return map
}

export function generateEmptyMap(width: number, height: number) {
    const size = new Vector2D(width, height)

    const map = new GameMap('empty', size)
    
    const tiles = new Array(width * height).fill(new Tile(BLANK_TILE))

    map.setTiles(tiles)

    return map
}

async function makeTileMap(tileset: TileSet, resource: string, size: [width: number, height: number], atlas : Record<string, [x: number, y: number]>): Promise<TileMap | undefined> {
    const texture = new Texture(resource)
    const textureLoaded = await texture.load()
    if (textureLoaded) {
        const spritesheet = new SpriteSheet(texture)
        return new TileMap(tileset, spritesheet, { atlas, size })
    }
}
