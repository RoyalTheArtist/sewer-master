import { App } from "../app.base"
import { MapMaker } from "./mapmaker"

export class MapInfoView extends App {
    _el: HTMLElement
    constructor(public parent: MapMaker, elem: string) {
        super()
        this._el = document.querySelector(elem) as HTMLElement
    }

    init() {
        this.draw()
    }

    draw() {

    }

    saveMap() {
        const parent = this.parent
        return parent.map.saveMap()
    }
}