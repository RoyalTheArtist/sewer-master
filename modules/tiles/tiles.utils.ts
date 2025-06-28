import { Vector2D } from "@engine/utils"
import { TileBitmask } from "./tile.components"
import { TileManager } from "./tile.manager"

const bitmaskDirections = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
  ]
  
export function calculateBitmask(manager: TileManager) {
    for (let x = 0; x < manager.width; x++) {
      for (let y = 0; y < manager.height; y++) {
        const tile = manager.getTile(new Vector2D(x, y))
        if (tile && tile.transparent) {
          let bitmask = 0
          bitmaskDirections.forEach(([dx, dy]) => {
            const tx = x + dx
            const ty = y + dy
            if (tx >= 0 && tx < manager.width && ty >= 0 && ty < manager.height) {
              const otherTile = manager.getTile(new Vector2D(tx, ty))
              if (otherTile && otherTile.transparent) {
                bitmask |= 1 << (dx + dy * 8)
              }
            }
          }) 
          
          tile.addComponent(new TileBitmask(bitmask))
        }
      }
    }
  }