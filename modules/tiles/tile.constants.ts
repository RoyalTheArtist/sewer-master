import { Tile } from "./tile.base"

export const FLOOR_TILE: Tile = {
    passable: true,
    transparent: true,
    appearance: {
      resource: "sewers",
      sprite: "grass",
      color: "black"
    }
  }
  
  export const WALL_TILE: Tile = {
    passable: false,
    transparent: true,
    appearance: {
      resource: "sewers",
      sprite: "brick",
      color: "white"
    }
  }