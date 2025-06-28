//import './style.scss'
import { TileSetLoader, MapView } from './components'
import { App } from '../app.base'
import { GameMap, loadMap } from '../../modules/map'
import { TileSetView } from './mm.tileSet'
import { MapInfoView } from './mm.mapInfo'
import { Vector2D } from '@engine/utils'

declare global {
    interface Window {
      mapmaker: MapMaker
    }
  }

const mapDataTwo = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 1, 0, 1, 1, 0, 1, 0, 1, 0,
    0, 1, 0, 1, 0, 0, 1, 0, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ]


class SignalSystem {
    signals: Map<string, Set<Function>> = new Map()
    constructor() {

    }

    on(signal: string, callback: Function) {
        if (!this.signals.has(signal)) {
            this.signals.set(signal, new Set<Function>())
        }
        this.signals.get(signal)?.add(callback)
    }

    emit(signal: string, ...args: any[]) {
        if (!this.signals.has(signal)) {
            return
        }

        this.signals.get(signal)?.forEach((callback) => {
            callback(...args)
        })
    }
}

export class MapMaker extends App {
    map: GameMap
    tileSetLoader: TileSetLoader
    mapView: MapView
    tileSet: TileSetView
    signals: SignalSystem = new SignalSystem()
    mapInfo: MapInfoView
    constructor(elem: string) {
        super()
        const app = document.querySelector(elem) as HTMLElement
        if (!app) {
            throw new Error('App not found')
        }
        this.tileSetLoader = new TileSetLoader(this, '#tileset-loader')
       
        //this.map = createMap(mapDataTwo, 10, 10)
        this.map = new GameMap(new Vector2D(25,25))
        this.mapView = new MapView(this, '#map')
        this.tileSet = new TileSetView(this, '#tileset')

        this.mapInfo = new MapInfoView(this, '#map-info')
    }

    initialize() {
        this.tileSetLoader.init()
        this.mapView.init()
        this.tileSet.init()

        this.signals.on('tilesetLoaded', (tileSet: TileSetView) => {
            //this.tileSet = tileSet
        })
    }

    render() {
        this.mapView.render()
    }

    saveMap() {
        const mapSave = this.map.saveMap()
        const tileSet = this.tileSet.tileset?.resource
        console.debug("Save Map", { tileSet, ...mapSave })

        sessionStorage.setItem('map', JSON.stringify({ tileSet, ...mapSave }))
    }

    async loadMap() {
        const map = sessionStorage.getItem('map')
        if (!map) return

        const { tileSet, ...mapInfo } = JSON.parse(map)
        const tileSetData = await loadData(tileSet)
        console.log(tileSetData, mapInfo)
        this.tileSetLoader.load(tileSetData)

        this.map = loadMap(mapInfo)
    }
}


const loadData = async (url: string) => {
    const response = await fetch(url)
    const data = await response.json()
    return data
}

const mapMaker = new MapMaker('#mapmaker')
window.mapmaker = mapMaker
function main() {
    
    mapMaker.initialize()

    function render() {
        mapMaker.render()

        requestAnimationFrame(render)
    }

    render()
}


window.onload = () => {
    main()
}

window.addEventListener('resize', () => {
    mapMaker.mapView.resize()
})