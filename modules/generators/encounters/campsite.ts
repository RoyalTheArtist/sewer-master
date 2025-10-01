import { TinyMap, TinyRoom, TinyTile } from './../temporary';
import { Encounter } from "./baseEncounter"

export class CampsiteEncounter extends Encounter {
    constructor(room: TinyRoom) {
        super(room)
    }

    place(map: TinyMap): Encounter {
        const campsiteX = Math.floor(this.room.x + (this.room.width / 2))
        const campsiteY = Math.floor(this.room.y + (this.room.height / 2))

        const tile = map.tiles.getCell(campsiteX, campsiteY) as TinyTile
        tile.passable = true
        tile.appearance?.changeAppearance("camp-lit")
        return this
    }
}