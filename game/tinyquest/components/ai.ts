import { Action, NoAction } from "../actions/action"
import { Component, Entity } from "../ecs"

export class AI extends Component {
    get entity() { return this.parent }
    constructor(private parent: Entity) { super() }
    perform(): Action { return new NoAction() }
}