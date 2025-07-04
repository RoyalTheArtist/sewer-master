import { Component } from "@engine/ecs";

export class Appearance extends Component {  
    looksLike: string
    constructor(looksLike: string) { super(); this.looksLike = looksLike }
}

export class ActorAppearance extends Appearance {
    spritesheet: { resource: string, size: [number, number] }
    start: [number, number]

    constructor(looksLike: string, spritesheet: { resource: string, size: [number, number] }, start: [number, number]) {
        super(looksLike)
        this.spritesheet = spritesheet
        this.start = start
    }
}