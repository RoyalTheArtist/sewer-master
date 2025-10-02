import { TinyRoom } from "@/tinyquest/tinyMap";

export abstract class Encounter {
    constructor(public room: TinyRoom) { }

    abstract place(...args: any): Encounter
}