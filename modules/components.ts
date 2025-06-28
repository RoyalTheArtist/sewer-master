import { Component } from "@engine/ecs";
import { Vector2D } from "@engine/utils";

export class Position extends Component {

    public position: Vector2D = new Vector2D(0, 0)  

    constructor(position: Vector2D) {
        super();
        this.position = position
    }
}

export class BlocksMovement extends Component {}