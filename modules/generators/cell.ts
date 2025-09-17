import { Vector2D } from '@engine/utils';
import { Region } from './region';


export class Cell<T> {
  private _pos: Vector2D
  public region: Region<T> | undefined
  public data: T | undefined

  public get position(): Vector2D { return this._pos }
  public get x(): number { return this._pos.x }
  public get y(): number { return this._pos.y }

  constructor(x: number, y: number, data?: T) {
    this._pos = new Vector2D(x, y)
    this.data = data
  }
    
  public get coordinates(): [number, number] {
    return [this.x, this.y];
  }
}
