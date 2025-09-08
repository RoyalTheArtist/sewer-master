import type { Actor } from "@modules/actors/actors"
import type { Tile } from "@modules/tiles"

type GeneratePreMade = {
  terrain: number[],
  legend: string[]
}

type ProcGenMap = {}

type TerrainLoadData = {
  terrain: Tile[],
  entities?: {
    actors: Actor[]
  }
}

type LayoutTypes = { generate: GeneratePreMade | ProcGenMap } | { terrain: TerrainLoadData}

export interface MapLoadData {
  meta: {
    name: string,
    width: number,
    height: number
  },
  tileset: string,
  layout: LayoutTypes,
}

export interface MapGenerationData {
  meta: {
    name: string,
    size: [width: number, height: number],
    spritesheet: string
  },
  terrain: {
    tileset: TilesetData,
    layout: number[]
  },
  entities: Array<Entity>
}