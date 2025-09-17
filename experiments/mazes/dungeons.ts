import { Resources } from './../../modules/assets/loader';
import { Surface } from "@engine/render/surface";
import { Grid, Cell, Region } from "../grid/grid";
import { Color } from "@engine/utils/color";
import { Vector2D } from "@engine/utils";
import { Path, Room, RoomsAndMazes} from "./gridGenerator";
import type { RoomsAndMazesOptions } from './gridGenerator';
import { Toolbar } from "./utils";
import { CanvasViewport } from "@engine/render/viewport";
import { Sprite } from "@engine/render/graphics/sprite";

const PATH_PALETTE = [
    new Color(202, 160, 90),
    new Color(139, 64, 73),
    new Color(81, 82, 98),
    new Color(142, 160, 145)
]

const GENERATOR_OPTIONS: GeneratorOptions = Object.freeze({
    pruneAmounts: 150,
    maxRoomAttempts: 90,
    minRoomSize: 2,
    maxRoomSize: 5
} as const)

// DIRECTIONS: TOP, RIGHT, BOTTOM, LEFT
const DIRECTIONS_CARDINAL = [[0, -1], [1, 0], [0, 1], [-1, 0]]

function findConnectors(grid: Grid) {
    const cardinalDirections = [[0, 1], [1, 0]] as number[][];

    const connectors = [] as Cell[]

    for (const cell of grid.getAllCells().filter(cell => !cell.isWalkable())) {
        for (const direction of cardinalDirections) {
            const neighborCell = grid.getCell(cell.getX() + direction[0], cell.getY() + direction[1]) as Cell;
            const secondNeighbor = grid.getCell(cell.getX() + direction[0] * -1, cell.getY() + direction[1] * -1) as Cell;
            
            if (neighborCell?.isWalkable() && secondNeighbor?.isWalkable() && neighborCell?.color !== secondNeighbor?.color) {
                connectors.push(cell);
            }
        }
    }

    return connectors
}

class DisplayRoomsAndMazes extends RoomsAndMazes {
    section: HTMLElement
    surface: Surface
    cellSize: number
    cellDimensions: Vector2D
    constructor(name: string, cellSize: number, width: number, height: number, options?: RoomsAndMazesOptions) {
        super(width, height, options)
        this.cellSize = cellSize
        this.cellDimensions = new Vector2D(cellSize, cellSize)

        const section = document.querySelector(`#${name}`) as HTMLElement
        if (!section) throw new Error(`Could not find section ${name}`)
        this.surface = Surface.makeSurface(width * cellSize, height * cellSize)
        section.appendChild(this.surface.canvas)

        this.section = section
    }

    public draw() {
        this.grid.draw(this.surface, this.cellSize)

         if (this.mazeBuilder.currentCell) {
            this.surface.drawRect(new Vector2D(this.mazeBuilder.currentCell.getX() * this.cellSize, this.mazeBuilder.currentCell.getY() * this.cellSize), this.cellDimensions, Color.fromString("blue"))
        }

    }
}

type GeneratorOptions = RoomsAndMazesOptions & {
    pruneAmounts?: number
}


class DungeonGenerator {
    dungeon: DisplayDungeon

    deadEnds: Cell[] = []
    pruneAmounts: number = 10

    connectors: Cell[] = []

    gridBuilder: DisplayRoomsAndMazes

    public get working() { return this.gridBuilder.mazeBuilder.currentCell !== null }
    constructor(width: number, height: number, cellSize: number = 5, options?: GeneratorOptions) {
        this.gridBuilder = new DisplayRoomsAndMazes('work-maze', cellSize * 2, width / 2, height / 2, options)
        this.dungeon = new DisplayDungeon('dungeon', cellSize, width, height)

        if (options) {
            this.pruneAmounts = options.pruneAmounts || this.pruneAmounts
        }
    }

    public start() {
        this.dungeon.reset()
        this.deadEnds = []
        this.connectors = []

        this.gridBuilder.start()
    }

    public draw() {
        this.dungeon.drawDungeon(false)
        this.gridBuilder.draw()
       
        for (const cell of this.deadEnds) {
            this.dungeon.surface.drawRect(new Vector2D(cell.getX() * 5, cell.getY() * 5), new Vector2D(5, 5), Color.fromString("red"))
        }       

        drawConnectors(this.connectors, this.dungeon.surface, this.dungeon.cellSize)
    }

    public generate() {
        this.start()

        while (this.gridBuilder.step()) {
        }

        this.bake()
        this.collapseConnectors()
        this.pruneAll(this.pruneAmounts)
        this.identifyDeadEnds()
        this.draw()
    }

    public step() {
        this.gridBuilder.step()
    }

    public identifyDeadEnds() {
        this.deadEnds = []

        for (const cell of this.dungeon.maze.getCells()) {
            if (cell.isWalkable() === false) continue
            const walls = []

            for (const direction of DIRECTIONS_CARDINAL) {
                const neighborCell = this.dungeon.grid.getCell(cell.getX() + direction[0], cell.getY() + direction[1]) as Cell
                if (neighborCell && neighborCell.isWalkable() === false) {
                    walls.push(neighborCell)
                }
            }

            // if it's surrounded on three sides, it's a dead end
            if (walls.length === 3) {
                this.deadEnds.push(cell)
            }

            if (walls.length <= 2) {
                
                const walkableNeighbors = []

                for (const direction of DIRECTIONS_CARDINAL) {
                    const neighborCell = this.dungeon.grid.getCell(cell.getX() + direction[0], cell.getY() + direction[1]) as Cell
                    if (neighborCell?.isWalkable()) {
                        walkableNeighbors.push(neighborCell)
                    }
                }

                if (walkableNeighbors.length === 1) {
                    this.deadEnds.push(cell)
                }
            }
        }
    }

    public pruneDeadEnds() {
        this.identifyDeadEnds()
        for (const cell of this.deadEnds) {
            cell.setWalkable(false)
            this.dungeon.maze.removeCell(cell)
            cell.color = Color.fromString("black")
            cell.walls = [false, false, false, false]
        }
    }

    public pruneAll(until: number = 100) {
        this.identifyDeadEnds()
        while (this.deadEnds.length > 0 && until-- > 0) {
            this.pruneDeadEnds()
            this.identifyDeadEnds()
        }
    }

    public bake() {
        const { grid, maze, rooms } = this.gridBuilder.bake()
     
        this.dungeon.maze = maze
        this.dungeon.grid = grid
        
        this.dungeon.rooms = []
        for(const room of rooms) {
            this.dungeon.addRoom(room)
        }
    }

    public collapseConnectors() {
        this.connectors = findConnectors(this.dungeon.grid)

        while(this.connectors.length > 0) {
            const connector = this.connectors.pop()

            if (!connector) return
            for (const direction of DIRECTIONS_CARDINAL) {
                const neighborCell = this.dungeon.grid.getCell(connector.getX() + direction[0], connector.getY() + direction[1]) as Cell
                
                try { 
                const room = this.dungeon.getRoom(neighborCell.getX(), neighborCell.getY())

                if (room) {
                    room.addExit(connector)
                    this.connectors.splice(this.connectors.indexOf(connector), 1)
                    
                    this.pruneConnectors(room)
                }
                } catch (e) {
                    console.error(e)
                    throw e
                }
            }
        }
    }

    public pruneConnectors(room: Room) {
        const touchingConnectors = this.connectors.filter(connector => {
            for (const direction of DIRECTIONS_CARDINAL) {
                const neighborCell = this.dungeon.grid.getCell(connector.getX() + direction[0], connector.getY() + direction[1]) as Cell
                
                if (neighborCell?.region === room) {
                    return true
                }
            }
        })

        for (const connector of touchingConnectors) {
            if (Math.random() * 200 < 2) room.addExit(connector)
            this.connectors.splice(this.connectors.indexOf(connector), 1)
        }
    }
}



class Dungeon {
    rooms: Room[]
    maze: Path
    grid: Grid

    constructor(public width: number, public height: number) {
        this.grid = new Grid(width, height)
        this.rooms = []
        this.maze = new Path(PATH_PALETTE[Math.floor(Math.random() * PATH_PALETTE.length)])
        this.maze.grid = this.grid
    }

    public reset() {
        this.grid.resetGrid()
        this.rooms = []
        this.maze = new Path(PATH_PALETTE[Math.floor(Math.random() * PATH_PALETTE.length)])
    }

    public addRoom(room: Room) {
        if (Room.doesNotOverlap(room, this.rooms)) {
            room.grid = this.grid
            this.rooms.push(room)
            this.placeRoom(room)
        }
    }

    public placeRoom(room: Room) {
        for (let i = room.x; i < room.x + room.width; i++) {
            for (let j = room.y; j < room.y + room.height; j++) {
                const cell = this.grid.getCell(i, j) as Cell;
                cell?.setWalkable(true);

                if (i === room.x) cell.walls[3] = true;
                if (j === room.y) cell.walls[0] = true;
                if (i === room.x + room.width - 1) cell.walls[1] = true;
                if (j === room.y + room.height - 1) cell.walls[2] = true;

                room.addCell(cell);
            }
        }
    }

    public addToMaze(cell: Cell) {
        cell.setWalkable(true)
        this.maze.addCell(cell)
    }

    public getRoom(x: number, y: number) {
        for (const room of this.rooms) {
            if (x >= room.x && x < room.x + room.width && y >= room.y && y < room.y + room.height) {
                return room;
            }
        }
    }
}

class DisplayDungeon extends Dungeon {
    section: HTMLElement
    surface: Surface
    cellSize: number
    constructor(name: string, cellSize: number, width: number, height: number) {
        super(width, height)
        this.cellSize = cellSize

        const section = document.querySelector(`#${name}`) as HTMLElement
        if (!section) throw new Error(`Could not find section ${name}`)
        this.surface = Surface.makeSurface(width * cellSize, height * cellSize)
        section.appendChild(this.surface.canvas)

        this.section = section
    }

    public drawDungeon(drawWalls: boolean = true) {
        this.grid.draw(this.surface, this.cellSize, drawWalls)
    }
}

class ForestMapModule {
    map: TinyMap | undefined
    _viewport: CanvasViewport | undefined

    public get viewport(): CanvasViewport {
        if (!this._viewport) this.init()
        if (!this._viewport) throw new Error("Viewport initialization failed when accessing viewport")
        return this._viewport
    }
    constructor(public width: number, public height: number) {
    }

    init() {
        this._viewport = CanvasViewport.createViewport(this.width, this.height).attachTo("forest-map")
        return this
    }

    setMap(map: TinyMap) {
        this.map = map
        return this
    }

    public buildMap(dungeon: Dungeon) {
        const blankTile = new TinyTile(0, 0, false, false)
        const appearanceInfo = appearanceLibrary.get("blank") as { appearance: Appearance, graphicsData: AppearanceData }
        const graphic = new ColorGraphics(0, 0, 16, 16, Color.fromString("black"))
        blankTile.appearance = appearanceInfo?.appearance
        blankTile.appearance.graphic = graphic
        blankTile.appearance?.init()
        const tinyMap = new TinyMap(dungeon.width, dungeon.height)
        tinyMap.fill((x, y) => {
            const copy = blankTile.copy(x, y)
            copy.appearance!.graphic = graphic
            copy.appearance?.init()
            copy.appearance!.parent = copy
            return copy
        })

        for (const cell of dungeon.grid.getAllCells()) {
            if (!cell.isWalkable()) {
                const tile = tinyMap.tiles.getCell(cell.getX(), cell.getY()) as TinyTile
                tile.passable = false
                tile.transparent = false
                const appearanceData = appearanceLibrary.get("tree")!
                tile.appearance = appearanceData.appearance.copy() 


                if (tile.appearance) {
                    tile.appearance.graphic = getAppearanceGraphic(appearanceData.graphicsData)
                    tile.appearance.init()
                }
            } else {
                // const tile = tinyMap.tiles.getCell(cell.getX(), cell.getY()) as TinyTile
                // tile.passable = true
                // tile.transparent = true
                // const appearanceData = appearanceLibrary.get("grass")!
                // tile.appearance = appearanceData.appearance.copy()
                // if (tile.appearance) {
                //     tile.appearance.graphic = getAppearanceGraphic(appearanceData.graphicsData)
                //     tile.appearance.init()
                // }
            }
        }

        for (const cell of dungeon.maze.getCells()) {
             const tile = tinyMap.tiles.getCell(cell.getX(), cell.getY()) as TinyTile
            tile.passable = true
            tile.transparent = true
            const appearanceData = appearanceLibrary.get("path")!
            tile.appearance = appearanceData.appearance.copy()
            if (tile.appearance) {
                tile.appearance.graphic = getAppearanceGraphic(appearanceData.graphicsData)
                tile.appearance.init()
            }   
        }

        for (const room of dungeon.rooms) {
            for (let i = room.x; i < room.x + room.width; i++) {
                for (let j = room.y; j < room.y + room.height; j++) {
                    const tile = tinyMap.tiles.getCell(i, j) as TinyTile
                    tile.passable = true
                    tile.transparent = true
                    const appearanceData = appearanceLibrary.get("grass")!
                    tile.appearance = appearanceData.appearance.copy()
                    if (tile.appearance) {
                        tile.appearance.graphic = getAppearanceGraphic(appearanceData.graphicsData)
                        tile.appearance.init()
                    }
                }
            }

            room.exits.forEach(exit => {
                const tile = tinyMap.tiles.getCell(exit.getX(), exit.getY()) as TinyTile
                tile.passable = true
                tile.transparent = true
                const appearanceData = appearanceLibrary.get("dirt")!
                tile.appearance = appearanceData.appearance.copy()
                if (tile.appearance) {
                    tile.appearance.graphic = getAppearanceGraphic(appearanceData.graphicsData)
                    tile.appearance.init()
                }
            })
        }
        this.setMap(tinyMap.init())
        return this
    }

    generateEncounters() {
        
    }

    draw() {
        this.viewport.surface.drawRect(new Vector2D(0, 0), new Vector2D(this.viewport.surface.width, this.viewport.surface.height), Color.fromString("black"))
        if (this.map) {
            this.map.draw(this.viewport.surface)
        }
        return this
    }
}


function drawConnectors(cells: Cell[], surface: Surface, cellSize: number) {
    const connectorRadius = 1;
    for (const cell of cells) {
        const centerX = cell.getX() * cellSize + cellSize / 2;
        const centerY = cell.getY() * cellSize + cellSize / 2;

        surface.drawCircle(new Vector2D(centerX, centerY), connectorRadius, Color.fromString("white"));
    }
}

class GraphicsObject {
    position: Vector2D = new Vector2D(0, 0)
    dimensions: Vector2D = new Vector2D(0, 0)
   
    constructor(x: number, y: number, width: number, height: number) {
        this.position.x = x
        this.position.y = y
        this.dimensions.x = width
        this.dimensions.y = height
        
    }

    draw(surface: Surface) { 
        surface.drawRect(this.position, this.dimensions, Color.fromString("magenta"))
     }
}

// saving this
//const index = Math.round(Math.sin((Math.cos(x) + Math.cos(y)) * Math.PI * 2) * (PATH_PALETTE.length / 2) + PATH_PALETTE.length / 2);

class ColorGraphics extends GraphicsObject {
    color: Color
    constructor(x: number, y: number, width: number, height: number, color: Color = Color.fromString("black")) {
        super(x, y, width, height)
        
        this.color = color
    }

    draw(surface: Surface) {
        surface.drawRect(this.position, this.dimensions, this.color)
    }
}



class AppearanceGraphics extends GraphicsObject {
    sprite: Sprite
    constructor(x: number, y: number, width: number, height: number, sprite: Sprite) {
        super(x, y, width, height)
        this.sprite = sprite
    }

    draw(surface: Surface) {
        surface.context.save()
        surface.context.translate(this.position.x, this.position.y)
        //this.sprite.position = this.position
        this.sprite.render(surface)
        surface.context.restore()
    }
}

class Appearance {
    parent: TinyTile | undefined
    graphic?: GraphicsObject
    constructor(public lookslike: string) { }

    init() {
        if (this.parent && this.graphic) {
            this.graphic.position.x = this.parent.x * 16
            this.graphic.position.y = this.parent.y * 16
            return this
        }
        //this.graphic = new ColorGraphics(0, 0, 16, 16)
        return this
    }

    copy() {
        const appearance = new Appearance(this.lookslike)
        appearance.parent = this.parent
        return appearance.init()
    }
}

abstract class NewCell {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

class TinyTile extends NewCell {
    passable: boolean = false
    transparent: boolean = false
    appearance?: Appearance
    constructor(public x: number, public y: number, passable?: boolean, transparent?: boolean, appearance?: Appearance) {
        super(x, y)
        this.passable = passable || false
        this.transparent = transparent || false
        this.appearance = appearance
    }

    copy(x: number = this.x, y: number = this.y): TinyTile {
        const copyAppearance = new Appearance(this.appearance?.lookslike || "blank")
        const copyTile = new TinyTile(x, y, this.passable, this.transparent, copyAppearance)
        copyAppearance.parent = copyTile
        return new TinyTile(x, y, this.passable, this.transparent, new Appearance(this.appearance?.lookslike || ""))
    }

    init() {
        if (this.appearance) {
            this.appearance.parent = this
            this.appearance.init()
        }
        return this
    }
}



class NewGrid<T extends NewCell> {
    readonly width: number
    readonly height: number
    private _cells: T[][]

    public get cells(): T[][] { return this._cells }
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
      
        this._cells = new Array(height).fill(0).map(() => new Array(width).fill(0));
    }

    public fill(fill: (x: number, y: number) => T) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this._cells[y][x] = fill(x, y)
            }
        }
        return this
    }
    
    public getCell(x: number, y: number): T | undefined {
        if (!this.isWithinBounds(x, y)) return undefined;
        return this._cells[y][x];
    }

    public isWithinBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
}

class TinyMap {
    tiles: NewGrid<TinyTile>
    appearances: Appearance[] = []
    constructor(width: number, height: number) {
        this.tiles = new NewGrid<TinyTile>(width, height)
    }

    public fill(fill: (x: number, y: number) => TinyTile) {
        this.tiles.fill(fill)
        return this
    }

    draw(surface: Surface) {
        for (let appearance of this.appearances) {
            appearance.graphic?.draw(surface)
        }
        // for(let tile of this.tiles.cells.flat()) {
        //     surface.drawRect(new Vector2D(tile.x * 16, tile.y * 16), new Vector2D(16, 16), Color.fromString("green"))
        // }
    }

    init() {
        this.appearances = []
        for (let tile of this.tiles.cells.flat()) {
            tile.init()
            if (tile.appearance && tile.appearance.graphic) {
                this.appearances.push(tile.appearance)
                
            }
        }
        return this
    }
}


type AppearanceData = {
    graphics: {
        resource: string
        size: [number, number]
        location: [number, number]
    }
}

type TilesetData = {
    meta: {}
    appearances: Record<string, AppearanceData>
}

const appearanceLibrary = new Map<string, {
    appearance: Appearance,
    graphicsData: AppearanceData
}>()

function createAppearances(appearanceData: Record<string, AppearanceData>) {
    const blankAppearance = new Appearance("blank")
    appearanceLibrary.set("blank", { appearance: blankAppearance, graphicsData: { graphics: { resource: "", size: [0, 0], location: [0, 0] } } })
    for (const [name, data] of Object.entries(appearanceData)) {
        if (!appearanceLibrary.has(name)) {
            const appearance = new Appearance(name)
            appearanceLibrary.set(name, { appearance, graphicsData: data })
            if (data.graphics.resource) {
                Resources.loadSpritesheet(data.graphics.resource)
            }
        }
    }
}

function getAppearanceGraphic(data: AppearanceData) {
    const spritesheet = Resources.loadSpritesheet(data.graphics.resource)
    const sprite = spritesheet?.getSprite(new Vector2D(data.graphics.location[0], data.graphics.location[1]), new Vector2D(data.graphics.size[0], data.graphics.size[1]))
    const graphic = new AppearanceGraphics(0, 0, 16, 16, sprite)
    return graphic
}

async function main() {
    const tilesetData = await Resources.loadJson<TilesetData>('/data/tilesets/forest-module.json')
    createAppearances(tilesetData.appearances)
    const spritesheet = Resources.loadSpritesheet(tilesetData.meta.spritesheet)
    //const spritesheet = loadSpritesheet('../../data/tilesets/forest-module.png')
    //const tilesetData = await response.json()
    const toolbar = new Toolbar(document.body)
    const generator = new DungeonGenerator(120, 70, 5, GENERATOR_OPTIONS)
    const forestMap = new ForestMapModule(120 * 16, 70 * 16).init()
    console.log(tilesetData)
    function tick() {
        generator.step()
        generator.bake()
        generator.draw()

        if (generator.working) window.requestAnimationFrame(tick)
    }

    toolbar
        .addAction("step", () => {
            generator.step()
            generator.draw()
        })
        .addAction('Generate Maze', () => {
            generator.generate()
            generator.draw()  
        })
        .addAction('Watch Generation', () => {
            generator.start()
            window.requestAnimationFrame(tick)
        })
        .addAction('Prune Dead Ends', () => {
            generator.pruneAll(5)
            generator.draw()
        })
        .addAction("Convert", () => {
            forestMap.buildMap(generator.dungeon)
            forestMap.draw()
        }) 
    generator.draw()
}

window.onload = () => { main() }