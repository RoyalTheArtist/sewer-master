import { TinyMap, TinyRoom, TinyTile } from "../temporary"
import { Encounter } from "./baseEncounter"

export class PeacefulPondEncounter extends Encounter {
    constructor(room: TinyRoom) {
        super(room)
    }

    place(map: TinyMap): Encounter {
        const pondWidth = this.room.width - 4
        const pondHeight = this.room.height - 4

        const pondX = this.room.x + 2
        const pondY = this.room.y + 2

        for (let x = pondX; x < pondX + pondWidth; x++) {
            for (let y = pondY; y < pondY + pondHeight; y++) {
                if (x === pondX && y === pondY
                    || x === pondX + pondWidth - 1 && y === pondY + pondHeight - 1
                    || x === pondX + pondWidth - 1 && y === pondY
                    || x === pondX && y === pondY + pondHeight - 1) continue
                const tile = map.tiles.getCell(x, y) as TinyTile
                tile.passable = false
                tile.appearance?.changeAppearance("water")
            }
        }

        return this
    }
}