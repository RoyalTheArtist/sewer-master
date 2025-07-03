import type { Entity } from "@engine/ecs"

interface Actor extends Entity {
  name: string,
  position: [x: number, y: number],
  stats: {
    health: number,
    maxHealth: number
  }
  ai: string,
  appearance: {
    resource: string,
    sprite: string
  }
}