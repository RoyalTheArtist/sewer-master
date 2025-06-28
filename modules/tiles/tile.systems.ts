import { Entity, System } from "@engine/ecs"
import { TileDrawComponent } from "./tile.components"

export class TileDrawSystem extends System {
    public componentsRequired = new Set([TileDrawComponent])
    public components: Set<TileDrawComponent> = new Set()
  
    public query(entities: Set<Entity>): void {
      this.components = new Set()
      for (let entity of entities) {
        if (entity.hasAll(this.componentsRequired)) {
          this.components.add(entity.getComponent(TileDrawComponent))
        }
      }
    }
  
    public update(): void {
      for (const component of this.components) {
        component.update()
      }
    } 
  
  }