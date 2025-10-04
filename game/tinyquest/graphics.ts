import { Vector2D } from '@engine/utils';
import { Surface } from '@engine/render/surface';
import { TinyTile } from './tiles';
import { Sprite } from '@engine/render/graphics/sprite';
import { AssetManager } from '@engine/assets/manager';
import { BaseViewport } from '@engine/render';
import { Entity, System } from './ecs';
import { Position, World } from './components';
import { Appearance } from './components/appearance';
import { GraphicsContainer, GraphicsObject } from '@engine/render/graphics/base';

export class TileAppearance extends GraphicsObject {
    private tile: TinyTile
    constructor(tile: TinyTile, public width: number, public height: number, readonly spriteAtlas: Map<string, { sprite: Sprite, definition: SpriteDefinition }>) {
        super(tile.x * width, tile.y * height)
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

export class AppearanceGraphic extends GraphicsObject {
    centered: boolean = true
    appearance: Appearance
    constructor(appearance: Appearance, public width: number, public height: number, readonly spriteAtlas: Map<string, { sprite: Sprite, definition: SpriteDefinition }>) {
        super(0, 0)
        this.appearance = { ...appearance }
    }

    render(surface: Surface) {
        const definition = this.spriteAtlas.get(this.appearance.lookslike)
        if (!definition) return
        const sprite = definition.sprite
        surface.context.save()
        surface.context.translate(this.position.x, this.position.y)

        if (this.centered) {
            sprite.offset.x = -sprite.dimensions.x / 2
            sprite.offset.y = -sprite.dimensions.y / 2
        }
        sprite.render(surface)
        surface.context.restore()
    }
}

export type SpriteDefinition = {
    resource: string
    size: [number, number]
    location: [number, number]
}

export type AppearanceData = {
    graphic: SpriteDefinition
}

export class WorldViewer extends System {
    public componentsRequired: Set<Function> = new Set([Position, Appearance, World])
    graphicParents: Map<Entity | TinyTile, GraphicsObject> = new Map()
    tileLayer: GraphicsContainer
    entityLayer: GraphicsContainer
    appearanceLibrary = new Map<string, { sprite: Sprite, definition: SpriteDefinition }>()
    constructor(public resource: AssetManager, public viewport: BaseViewport) {
        super()
        this.tileLayer = new GraphicsContainer(viewport.surface)
        this.entityLayer = new GraphicsContainer(viewport.surface)
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

    addTiles(tiles: TinyTile[]) {
        for (let tile of tiles) {
            const graphic = new TileAppearance(tile, 16, 16, this.appearanceLibrary)
            this.graphicParents.set(tile, graphic)
            this.tileLayer.addGraphic(graphic)
        }
    }

    update(entities: Set<Entity>) {
        const entitySet = Array.from(entities.values()).reduce((acc, entity) => { 
            if (this.graphicParents.has(entity)) {
                acc.entitiesToRemove.splice(acc.entitiesToRemove.indexOf(entity), 1)
                return acc;
            }
            acc.entitiesToAdd.push(entity)
            
            return acc
         }, {
            entitiesToAdd: [] as Entity[],
            entitiesToRemove: [...this.graphicParents.keys()].filter(entity => typeof entity === "number")
            
        })

        for (const entity of entitySet.entitiesToAdd) {
            const container = this.ecs.getComponents(entity)
            if (!container) throw new Error(`No container for entity ${entity}`)            
            const position = container.get(Position)
            const appearance = container.get(Appearance)

            const graphic = new AppearanceGraphic(appearance, 16, 16, this.appearanceLibrary)
            graphic.setPosition(position.x * 16 + 8, position.y * 16 + 8)
            this.graphicParents.set(entity, graphic)
            this.entityLayer.addGraphic(graphic)
        }

        for (const entity of entitySet.entitiesToRemove) {
            this.graphicParents.delete(entity)
        }
    }

    render() {
        const surface = this.viewport.surface
        this.tileLayer.render(surface)
        this.entityLayer.render(surface)
    }
}