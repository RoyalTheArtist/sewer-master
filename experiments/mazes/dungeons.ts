
import { Resources } from './../../modules/assets/loader';
import { Surface } from "@engine/render/surface";
import { Cell } from "@modules/generators/grid";
import { Color } from "@engine/utils/color";
import { Vector2D } from "@engine/utils";
import { type RoomsAndMazesOptions } from "@modules/generators/roomsAndMazes";
import { Toolbar } from "./utils";
import {  WalledCell, WalledGrid } from '@modules/generators/builders';
import { createAppearances, TilesetData } from '@modules/generators/temporary';
import { ForestMapGenerator } from '@modules/generators/mapGenerator'



class DisplayGrid {
    section: HTMLElement
    surface: Surface
    public grid: WalledGrid
    public cellSize
    public cellDimensions
    constructor(name: string, grid: WalledGrid, cellSize: number) {
        this.cellSize = cellSize
        this.grid = grid
        this.cellDimensions = new Vector2D(cellSize, cellSize)

        const section = document.querySelector(`#${name}`) as HTMLElement
        if (!section) throw new Error(`Could not find section ${name}`)
        this.surface = Surface.makeSurface(grid.width * cellSize, grid.height * cellSize)
        section.appendChild(this.surface.canvas)

        this.section = section
    }   

    public draw() {
        this.grid.draw(this.surface, this.cellSize)
    }
}

type GeneratorOptions = RoomsAndMazesOptions & {
    pruneAmounts?: number
}





function drawConnectors(cells: Cell[], surface: Surface, cellSize: number) {
    const connectorRadius = 1;
    for (const cell of cells) {
        const centerX = cell.x * cellSize + cellSize / 2;
        const centerY = cell.y * cellSize + cellSize / 2;

        surface.drawCircle(new Vector2D(centerX, centerY), connectorRadius, Color.fromString("white"));
    }
}



// saving this
//const index = Math.round(Math.sin((Math.cos(x) + Math.cos(y)) * Math.PI * 2) * (PATH_PALETTE.length / 2) + PATH_PALETTE.length / 2);

async function main() {
    const tilesetData = await Resources.loadJson<TilesetData>('/data/tilesets/forest-module.json')
    createAppearances(tilesetData.appearances)
    
    const toolbar = new Toolbar(document.body)
    const generator = new ForestMapGenerator(120, 70, 16).init()
    const displayMaze = new DisplayGrid("work-maze", generator.gridGenerator.grid, 10)

    function tick() {
        generator.step()
        generator.draw()

        if (false) window.requestAnimationFrame(tick)
    }

    toolbar
        .addAction("Generate Forest", () => {
            generator.generate()
            generator.draw()
            displayMaze.draw()
        })
        .addAction("Step", () => {
            generator.step()
            generator.draw()
            displayMaze.draw()
        })
        .addAction('Watch Generation', () => {
            generator.start()
            window.requestAnimationFrame(tick)
        })
        // .addAction('Prune Dead Ends', () => {
        //     generator.pruneAll(5)
        //     generator.draw()
        // })
         
    //generator.draw()
}

window.onload = () => { main() }