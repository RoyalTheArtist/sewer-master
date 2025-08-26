import { Cell, Grid } from "./grid";

export class Pathfinding {
  private grid: Grid;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  findPath(start: Cell, target: Cell): Cell[] {
    const maxIterations = 1000; // adjust this value as needed
    const openList: Cell[] = [start];
    const cameFrom: { [key: string]: Cell | undefined} = {};
    const gScore: { [key: string]: number } = { [`${start.getX()},${start.getY()}`]: 0 };
    const fScore: { [key: string]: number } = { [`${start.getX()},${start.getY()}`]: this.heuristic(start, target) };

    cameFrom[`${start.getX()},${start.getY()}`] = undefined;
    let iteration = 0;
    while (openList.length > 0 && iteration < maxIterations) {
        const current = openList.reduce((min, p) => fScore[`${p.getX()},${p.getY()}`] < fScore[`${min.getX()},${min.getY()}`] ? p : min, openList[0]);
        if (current === target) {
            const path: Cell[] = [];
            let pos: Cell | undefined = current;
            let prev: Cell | undefined
            while (pos) {
                path.push(pos);
                prev = cameFrom[`${pos.getX()},${pos.getY()}`];
                pos = prev

                if (pos === start) {
                    break;
                }
            }
            return path.reverse();
        }

        openList.splice(openList.indexOf(current), 1);
        for (const neighbor of this.getNeighbors(current)) {
        const tentativeGScore = gScore[`${current.getX()},${current.getY()}`] + 1;
        if (!gScore[`${neighbor.getX()},${neighbor.getY()}`] || tentativeGScore < gScore[`${neighbor.getX()},${neighbor.getY()}`]) {
            cameFrom[`${neighbor.getX()},${neighbor.getY()}`] = current;
            gScore[`${neighbor.getX()},${neighbor.getY()}`] = tentativeGScore;
            fScore[`${neighbor.getX()},${neighbor.getY()}`] = tentativeGScore + this.heuristic(neighbor, target);
            if (!openList.includes(neighbor)) {
            openList.push(neighbor);
            }
        }
        }
        iteration++;
    }

    console.error("No path found or maximum iterations reached");
    return [];
}

  private heuristic(a: Cell, b: Cell): number {
    return Math.abs(a.getX() - b.getX()) + Math.abs(a.getY() - b.getY());
  }

  private getNeighbors(cell: Cell): Cell[] {
    const neighbors: Cell[] = [];
    for (const dx of [-1, 0, 1]) {
      for (const dy of [-1, 0, 1]) {
        if (dx === 0 && dy === 0) continue;
        const nx = cell.getX() + dx;
        const ny = cell.getY() + dy;
        if (this.grid.isWithinBounds(nx, ny)) {
          neighbors.push(this.grid.getCell(nx, ny));
        }
      }
    }
    return neighbors.filter(neighbor => neighbor.isWalkable());
  }
}