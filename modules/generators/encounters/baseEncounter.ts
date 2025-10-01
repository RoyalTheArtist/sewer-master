import { TinyRoom } from "../temporary";

export abstract class Encounter {
    constructor(public room: TinyRoom) { }

    abstract place(...args: any): Encounter
}