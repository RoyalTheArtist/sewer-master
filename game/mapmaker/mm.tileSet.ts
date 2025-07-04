import { imageTextureShader } from '../../../../webgl/shaders';
import { App } from "../app.base"
import { TileSet } from "../../modules/assets/tiles"
import { Tile } from "../maps/map"
import { MapMaker } from "./mapmaker"




export class TileSetView extends App {
    _el: HTMLElement
    tileset: TileSet | null
    activeTile: Tile | null = null
    activeTileView: HTMLElement 
    tileSetView: HTMLElement
    parent: MapMaker
    constructor(parent: MapMaker, elem: string) {
        super()
        this.parent = parent
        this._el = document.querySelector(elem) as HTMLElement

        if (!this._el) {
            throw new Error('TileSetView Init Error:App not found')
        }

        this.tileset = null

        this.activeTileView = this._el.querySelector('.active-tile') as HTMLElement
        this.tileSetView = this._el.querySelector('.tiles') as HTMLElement
    }

    init() {
        this.draw()

        this._el.addEventListener('click', (e) => {
            const handler = this.handleMouseClick(e)

            if (handler) handler()

            this.draw()
        });

        (this.parent as MapMaker).signals.on('tilesetLoaded', (tileSet: TileSet) => {
            this.tileset = tileSet
            this.draw()
        })
    }

    handleMouseClick = (e: MouseEvent) => {
        if (!e.target) return null
        if (e.target.parentNode && e.target.parentNode.matches('.tile')) return () => this.changeActiveTile(e.target as HTMLElement)
        return null;
    }

    changeActiveTile(elem: HTMLElement) {
        const color = elem.getAttribute("data-key")

        if (!color) return
        
        const tile = this.tileset?.getTile(color);
            
        if(!tile) return
        this.activeTile = tile;
        (this.parent as MapMaker).signals.emit('changeTile', tile)
    }

    draw() {
        if(!this.tileset) return
        
        let image

        if (this.activeTile?.sprite) {
            image = this.tileset.getTileImage(this.activeTile?.sprite)
        }
         
        drawActiveTileView(this.activeTileView, this.activeTile, image)

        this.tileSetView.innerHTML = ''
        this.tileset.tiles.forEach((tile, key) => {
            if (!tile.sprite) return
            const tileEl = document.createElement('div')
            tileEl.classList.add('tile')
           
            
            const image = this.tileset?.getTileImage(tile.sprite)
            if (image) {
                image.setAttribute("data-key", key)
                tileEl.appendChild(image)
            }
           
            this.tileSetView.appendChild(tileEl)
        })

    }
}

function drawActiveTileView(target: HTMLElement, tile: Tile | null, image: HTMLImageElement | undefined): void {
    if (!tile) return
    
    const properties = target.querySelector('.properties') as HTMLElement
    const header = target.querySelector('header') as HTMLElement
    target.innerHTML = ''

    // render basic tile info
    header.innerHTML = ''
    const activeTile = document.createElement('div')
    activeTile.setAttribute('class', 'tile')
  
    if (image) {
        activeTile.appendChild(image)
    }
    header.appendChild(activeTile)
    header.innerHTML += `<label for="name">Tile Name: <input type="text" name="name" value="${tile.color}"></label>`
    target.appendChild(header)

    const passable = properties?.querySelector('input[name="passable"]') as HTMLInputElement
    const transparent = properties?.querySelector('input[name="transparent"]') as HTMLInputElement
    transparent.checked = tile.transparent
    passable.checked = tile.passable
    target.appendChild(properties)

}
