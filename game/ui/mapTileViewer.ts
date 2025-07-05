
import { Entity } from "@engine/ecs"
import { IRenderable, Surface } from "@engine/render/surface"
import { Vector2D } from "@engine/utils"
import { TileSprite } from "@modules/rewrites/tiles/tile"
import { SpriteSheet } from "@engine/render/graphics/spritesheet"
import { ActorAppearance } from "@modules/actors/components/appearance"
import { Position } from "@modules/components"
import { GraphicsObject } from "@engine/render/graphics/base"
import { EventSystem } from "@/eventSystem"
import { AnimationManager } from "@engine/render/graphics/animations"
import { MoveGraphicsAnimation, MoveSpriteAnimation } from "@modules/animations"


export class MapTileViewer implements IRenderable {
    private _tiles: TileSprite[]
    constructor(tiles: TileSprite[] = []) { 
      this._tiles = tiles
    }

    get tiles() { return this._tiles }
    render(surface: Surface) {
        this.tiles.forEach((tile) => tile.render(surface))
        return surface
    }
    
    setTiles(tiles: TileSprite[]) {
        this._tiles = Array.from(tiles) //tiles
        console.info(this._tiles)
    }
}



export class MapEntityViewer implements IRenderable {
    private _graphics: Map<Entity,GraphicsObject> = new Map()

    constructor() {
        EventSystem.on('entity:moved', this.handleMovedEntity)
    }
    get graphics() { return this._graphics }



    public handleMovedEntity = (args: any) => {
        const { entity, to, from } = args
        console.info('entity moved', { entity, to, from })

        const graphic = this._graphics.get(entity)
        if (!graphic) return

        const curTilePos = new Vector2D(graphic.position.x, graphic.position.y)
        const nextTilePos = new Vector2D(to.x * 16, to.y * 16)

        AnimationManager.triggerAnimation(new MoveGraphicsAnimation(graphic, nextTilePos, curTilePos, 100))
    }

    render(surface: Surface) {
        this.graphics.forEach((graphics) => graphics.render(surface))
        return surface
    }

    addEntity(entity: Entity) {
        if (!entity.hasAll(new Set([ActorAppearance, Position]))) return
        const appearance = entity.getComponent(ActorAppearance)
        const entityPosition = entity.getComponent(Position)

        const dimensions = new Vector2D(appearance.start[0], appearance.start[1])
        const size = new Vector2D(appearance.spritesheet.size[0], appearance.spritesheet.size[1])
        const start = new Vector2D(dimensions.x * size.x, dimensions.y * size.y)
        
        const spritesheet = SpriteSheet.loadFrom(appearance.spritesheet.resource)
        const sprite = spritesheet.getSprite(start, size)
        
        const graphicPosition = new Vector2D(entityPosition.position.x * size.x, entityPosition.position.y * size.y)
        const graphicsObject = new GraphicsObject(graphicPosition, size)
        graphicsObject.setSprite(sprite)

        this._graphics.set(entity, graphicsObject)        
    }
        

    setEntities(entities: Set<Entity>) {
        this._graphics.clear()
        for (let entity of entities) {
            this.addEntity(entity)
        }
    }
}