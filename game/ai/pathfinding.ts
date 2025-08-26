import { Vector2D } from '@engine/utils/vectors';
import { Actor } from '@modules/actors/actors';
import { GameMap } from '@modules/map/map';

export class Pathfinding {

  constructor(public actor: Actor) {
  }

  findPath(start: Vector2D, target: Vector2D): Vector2D[] {
    const openList: Vector2D[] = [start];
    const cameFrom: Map<Vector2D, Vector2D> = new Map();
    const gScore: { [key: string]: number } = { [`${start.x},${start.y}`]: 0 };
    const fScore: { [key: string]: number } = { [`${start.x},${start.y}`]: this.heuristic(start, target) };

    while (openList.length > 0) {
      const current = openList.reduce((min, p) => fScore[`${p.x},${p.y}`] < fScore[`${min.x},${min.y}`] ? p : min, openList[0]);
      if (current.x === target.x && current.y === target.y) {
        const path: Vector2D[] = [];
        let pos: Vector2D | undefined = current;
        while (pos) {
          path.push(pos);
          pos = cameFrom.get(pos);

          if (pos === start) {
 
            break;
          }
        }
        return path.reverse();
      }

      openList.splice(openList.indexOf(current), 1);
      for (const neighbor of this.getNeighbors(current)) {
        const tentativeGScore = gScore[`${current.x},${current.y}`] + 1;
        if (!gScore[`${neighbor.x},${neighbor.y}`] || tentativeGScore < gScore[`${neighbor.x},${neighbor.y}`]) {
          cameFrom.set(neighbor, current);
          gScore[`${neighbor.x},${neighbor.y}`] = tentativeGScore;
          fScore[`${neighbor.x},${neighbor.y}`] = tentativeGScore + this.heuristic(neighbor, target);
          if (!openList.includes(neighbor)) {
            openList.push(neighbor);
          }
        }
      }
    }

    return [];
  }

  private getNeighbors(position: Vector2D): Vector2D[] {
    const neighbors: Vector2D[] = [];
    for (const dx of [-1, 0, 1]) {
      for (const dy of [-1, 0, 1]) {
        if (dx === 0 && dy === 0) continue;
        const x = position.x + dx;
        const y = position.y + dy;
        const gameMap = this.actor.parent as GameMap;
        if (x >= 0 && x < gameMap.width && y >= 0 && y < gameMap.height) {
          const passable = gameMap.isPassable(new Vector2D(x, y)); 
          if (passable) {
            neighbors.push(new Vector2D(x, y));
          }
        }
      }
    }
    return neighbors;
  }

  private heuristic(a: Vector2D, b: Vector2D): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
}