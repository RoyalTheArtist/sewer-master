// game/ai/sense.ts
import { Component } from "@engine/ecs";
import { Entity } from "@engine/ecs";
import { Vector2D } from "@engine/utils/vectors";

export class Sense extends Component {
  private range: number;
  private entitiesInSight: Set<Entity>;

  constructor(range: number) {
    super();
    this.range = range;
    this.entitiesInSight = new Set();
  }

    public update(delta: number): void {
      return
    // this.entitiesInSight.clear();
    // for (const entity of entities) {
    //   const distance = Vector2D.distance(this.parent.position, entity.position);
    //   if (distance <= this.range) {
    //     this.entitiesInSight.add(entity);
    //   }
    // }
  }

  public getEntitiesInSight(): Set<Entity> {
    return this.entitiesInSight;
  }
}