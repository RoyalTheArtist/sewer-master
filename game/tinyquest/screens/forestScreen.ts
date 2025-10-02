import { BaseScreen } from "@engine/screen.base";

import { GraphicsObject } from "@modules/generators/temporary";
import { InputManager } from "@engine/input/inputManager";
import { Settings } from "@/settings";
import { ForestGenerator } from "@modules/generators/mapMakers/forest";
import { GameInputHandler } from "@/screens/game/game.handler";
import { Appearance, TinyTile, TTile } from "../tiles";
import { TinyMap } from "../tinyMap";
import { Surface } from "@engine/render/surface";
import { AssetManager } from "@engine/assets/manager";
import { Engine } from "@engine/engine";
import { Vector2D } from "@engine/utils/vectors";
import { Sprite } from "@engine/render/graphics/sprite";

export type SpriteDefinition = {
    resource: string
    size: [number, number]
    location: [number, number]
}

export type AppearanceData = {
    graphic: SpriteDefinition
}

export type TModule = {
    meta: {}
    resources: string[]
    appearances: Record<string, AppearanceData>
    tiles: TTile[]
}


// class AppearanceAtlas {
//     library: Map<string, Appearance>
// }

class GameAtlas {

}

class TileAppearance extends GraphicsObject {
    private tile: TinyTile
    constructor(tile: TinyTile, width: number, height: number, readonly spriteAtlas: Map<string, { sprite: Sprite, definition: SpriteDefinition }>) {
        super(tile.x * width, tile.y * height, width, height)
        this.tile = tile
    }
    render(surface: Surface) {
        const definition = this.spriteAtlas.get(this.tile.appearance.lookslike)
        if (!definition) return
        const sprite = definition.sprite
        surface.context.save()
        surface.context.translate(this.position.x, this.position.y)
        sprite.render(surface)
        surface.context.restore()
    }
}

class AppearanceGraphic extends GraphicsObject {
    centered: boolean = true
    appearance: Appearance
    constructor(appearance: Appearance, width: number, height: number, readonly spriteAtlas: Map<string, { sprite: Sprite, definition: SpriteDefinition }>) {
        super(0, 0, width, height)
        this.appearance = appearance
    }

    render(surface: Surface) {
        const definition = this.spriteAtlas.get(this.appearance.lookslike)
        if (!definition) return
        const sprite = definition.sprite
        surface.context.save()
        surface.context.translate(this.position.x - sprite.dimensions.x / 2, this.position.y - sprite.dimensions.y / 2)
        sprite.render(surface)
        surface.context.restore()
    }
}

class MapVisualizer {
    appearances: Set<TileAppearance> = new Set()
    entity!: AppearanceGraphic
    appearanceLibrary = new Map<string, { sprite: Sprite, definition: SpriteDefinition }>()
    constructor (public resource: AssetManager) {}
    render(surface: Surface) {
        this.appearances.forEach((appearance) => appearance.render(surface))
        this.entity.render(surface)
    }

    addAppearanceData(appearances: Record<string, AppearanceData>) {
        for (const [name, data] of Object.entries(appearances)) {
                if (!this.appearanceLibrary.has(name)) {
                    const spritesheet = this.resource.loadSpritesheet(data.graphic.resource)
                    const sprite = spritesheet.getSprite(new Vector2D(data.graphic.location[0], data.graphic.location[1]), new Vector2D(data.graphic.size[0], data.graphic.size[1]))
                    this.appearanceLibrary.set(name, { sprite, definition: data.graphic })
                }
            }
    }

    addTileAppearances(tiles: TinyTile[]) {
        for (let tile of tiles) {
            this.appearances.add(new TileAppearance(tile, 16, 16, this.appearanceLibrary))
        }
    }

    addEntityAppearance(x: number, y: number) {
        const appearance = {
            lookslike: "adventurer"
        }
        this.entity = new AppearanceGraphic(appearance, 16, 16, this.appearanceLibrary)
        this.entity.setPosition(x, y)
    }
}

export class ForestScreen extends BaseScreen {
  private _handler: GameInputHandler = new GameInputHandler()
    private _map: TinyMap | undefined
    generator: ForestGenerator
    mapVisualizer 
    atlas = new GameAtlas()
    public get map(): TinyMap | undefined {
        return this._map
    }

    constructor(engine: Engine, private module: TModule) {
        super()
        this.engine = engine
        this.mapVisualizer = new MapVisualizer(engine.resource)
        this.generator = new ForestGenerator(70, 40)      
    }

    public async preload() {
        this.mapVisualizer.addAppearanceData(this.module.appearances)
        this.ready = true
        return this
    }

    public initialize() {
        this.generator.createTileset(this.module.tiles)
        const map = this.generator.generate().bake()
        this._map = map
        this.mapVisualizer.addTileAppearances(this._map.tiles.cellsFlat)
        const startingTile = this.generator.startingTile

        if (startingTile) this.mapVisualizer.addEntityAppearance(startingTile.x * 16 + 8, startingTile.y * 16 + 8)
        else this.mapVisualizer.addEntityAppearance(24, 24)
        return this
    }

    public loadModule(module: TModule) {
        this.module = module
    }

    update(_: number) {
        const inputs = InputManager.getInputs(Settings.keyboardMappings.gameScreen)
        this._handler.handleInput(inputs)
       
        return this
    }

    render(): void {
        if (this.engine?.render.viewport?.surface)
            this.mapVisualizer.render(this.engine.render.viewport.surface)
        // this.map?.draw(this.engine?.render.viewport.surface)
    }
}