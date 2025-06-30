import { loadTileSet, TileSetAtlas, TileSetData } from "../../../modules/assets/tiles"
import { MapMaker } from "./mapmaker"

class EventTimer {
    private _start: number
    private _end: number
    private _cleared: boolean = false
    constructor() {
        this._start = 0
        this._end = 0
    }

    get cleared() {
        return this._cleared
    }
    start() {
        this._start = performance.now()
        this._cleared = false
    }

    end() {
        this._end = performance.now()
        this._cleared = true
    }

    get duration() {
        return this._start - this._end
    }
}

class TimerManager {
    private _timers: Map<string, EventTimer> = new Map()

    start(name: string) {
        if (this._timers.has(name)) return

        if (this._timers.get(name)?.cleared) {
            this._timers.get(name)?.start()
            return
        }
        const newTimer = new EventTimer()
        newTimer.start()
        this._timers.set(name, newTimer)
    }

    end(name: string) {
        if (!this._timers.has(name)) return
        this._timers.get(name)?.end()
    }

    getduration(name: string) {
        if (!this._timers.has(name) && !this._timers.get(name)?.cleared) return 0
        return this._timers.get(name)?.duration
    }
}

const timer = new TimerManager()

export class TileSetLoader {
    el: HTMLElement
    fileInput: HTMLInputElement | null = null
    imgTarget: HTMLElement | null = null
    _parent: MapMaker
    constructor(parent: MapMaker, selector: string) {
        this._parent = parent
        this.el = document.querySelector(selector) as HTMLElement

        if (!this.el) {
            throw new Error('Tileset Loader not found')
        }
    }

    public init() {

        this.el.addEventListener('click', (e) => {
            const handler = this.handleClickEvent(e)
            if (handler) handler()
        })

        this.el.addEventListener('change', (e) => {
            const handler = this.handleChangeEvent(e)

            if (handler) handler()
        })
    }

    handleChangeEvent = (e: Event) => {
        if (!e.target) return
        if (e.target.matches('input[name="loadTiles"]')) return () => this.handleLoad(e.target as HTMLInputElement)
    }
    
    handleClickEvent = (e: Event) => {
        if (!e.target) return
        if (e.target.matches('.load-tileset')) return () => {
            const fileInput = this.el.querySelector('input[name="loadTiles"]') as HTMLInputElement

            if (!fileInput) {
                throw new Error('File Input not found')
            }

            fileInput.click()
        }
    }

    async handleLoad(elem: HTMLInputElement) {
        const tileSetData = await getFileInputAs<TileSetData>(elem);
        this.load(tileSetData)
    }
    async load(data: TileSetData) {
        // const tileSetData = await import(`../assets/${elem.value}`)
        
        const tileSet = await loadTileSet(data)
       
        if (!tileSet) {
            throw new Error('Tileset not found')
        }

        this.imgTarget = this.el.querySelector('.preview') as HTMLElement

        if (!this.imgTarget) {
            throw new Error('Image target not found')
        }

        if (tileSet.spritesheet.texture.loaded) {
            this.imgTarget.appendChild(tileSet.spritesheet.texture.image as HTMLImageElement)
        }

        (this._parent as MapMaker).signals.emit('tilesetLoaded', tileSet)
    }
}

function getFileInputAs<T>(elem: HTMLInputElement): Promise<T> {
    return new Promise((resolve, reject) => {
        const file = elem.files?.[0];
        if (!file) {
            reject('File not found')
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const json = event.target?.result as string;
            const tileInfo = JSON.parse(json);
 
            tileInfo.meta.resource = `src/data/${file?.name}`
            resolve(tileInfo);
        };
        reader.readAsText(file as File);
        timer.end('runPromise')
    })
}
   
