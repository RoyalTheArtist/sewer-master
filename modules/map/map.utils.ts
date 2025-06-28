
import { GameMap, IMapData } from "./map.base"

import { Vector2D } from "@engine/utils"
import { FLOOR_TILE, Tile, TileObject, WALL_TILE } from "@modules/tiles"

const TILE_ATLAS = new Map<string | number, Tile>([
    [1, WALL_TILE],
    [0, FLOOR_TILE],
  ])
  
export const Blank_Tile = {
    passable: true,
    transparent: true,
    bitmask: null,
    sprite: "blank",
    color: 'hsl(250, 25%, 75%)'
  }
  
/**
 * Creates a new GameMap from a 1D array of tile data. The `mapData` array
 * should contain `width * height` elements, where each element is a number
 * representing the tile type from the `TILE_ATLAS` map. The resulting map
 * will be a `GameMap` object with the same width and height as the input
 * parameters.
 * 
 * @param mapData 1D array of tile data
 * @param width The width of the map
 * @param height The height of the map
 * @returns A new `GameMap` object
 */
export function createMap(mapData: number[], width: number, height: number) {
  const tiles = processMap(mapData)
  const map = loadMap({ width, height, tiles })
  map.initialize()
  return map
}

export function processMap(tiles: number[]) {
  const mapData = new Array(tiles.length)
  for (let i = 0; i < tiles.length; i++) {
    mapData[i] = TILE_ATLAS.get(tiles[i])
  }
  return mapData
}

export function createEmptyMap(size: Vector2D) {
  const { x: width, y: height } = size
  const tiles = new Array(width * height)
  for (let i = 0; i < tiles.length; i++) {
    const x = i % width
    const y = Math.floor(i / width)
    tiles[i] = { ...Blank_Tile, position: new Vector2D(x, y) }
  }
  return tiles
}

/**
 * Loads a `GameMap` object from a serialized representation of the map.
 * The `mapData` object should contain the following properties:
 * - `width`: The width of the map
 * - `height`: The height of the map
 * - `tiles`: A 1D array of tile data, where each element is a `Tile` object.
 *
 * @param mapData The serialized map data
 * @returns A new `GameMap` object
 */
export function loadMap(mapData: IMapData) {
    const map = new GameMap(new Vector2D(mapData.width, mapData.height))
    map.tiles.setTiles(createTiles(mapData.tiles, new Vector2D(mapData.width, mapData.height)))  
    return map
}

function createTiles(tiles: Tile[], size: Vector2D): TileObject[] {
  const { x: width } = size
  const tileObjects = new Array(tiles.length)
  for (let [i, tile] of tiles.entries()) {
    const x = i % width
    const y = Math.floor(i / width)
    tileObjects[i] = new TileObject(new Vector2D(x, y), { ...tile })
  }
  return tileObjects
}