import { Component } from "../ecs";

export class Appearance extends Component {
    constructor(public lookslike: string) { super() }
}