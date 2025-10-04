import { Component } from "../ecs";
import { TinyMap } from "../tinyMap";

export class World extends Component {
    constructor(public map: TinyMap) { super() }
}