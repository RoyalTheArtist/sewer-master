<script setup lang="ts">
import { makeSurface, Surface } from '@engine/render';
import {  Rect, Vector2D } from '@engine/utils';
import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue';

import { Colors } from '@engine/render/graphics/colors'
import { MouseHandler } from '@engine/input/mouse';

const target = useTemplateRef('target')

const props = defineProps<{
    image: HTMLImageElement | null,
    atlas: Set<Rect>
}>()

const emits = defineEmits<{
    (e: 'sprite:add', sprite: Rect): Rect
    (e: 'sprite:delete', sprite: Rect): Rect
}>()

class SpritesheetViewer {
    surface: Surface
    mouse: MouseHandler
    gridHeight: number = 16
    gridWidth: number = 16
    atlas: Set<Rect> = new Set()
    _img: HTMLImageElement | null = null
    _selectFn: ((rect: Rect) => void) | null = null

    constructor(width: number = 500, height: number = 500) {
        this.surface = makeSurface(width, height)
        this.surface.context.imageSmoothingEnabled = false

        this.mouse = new MouseHandler()
        this.mouse.init(this.surface.canvas)

        this.mouse.onMouseDown(() => {
            if (this._selectFn) {
                this._selectFn(new Rect(this.lockedMousePos.x, this.lockedMousePos.y, this.gridWidth, this.gridHeight))
            }
        })
    }

    attachSurface(el: HTMLElement) {
        el.appendChild(this.surface.canvas)
    }

    draw() {
        this.surface.clear()
        this.surface.drawRect(new Vector2D(0, 0), new Vector2D(this.surface.width, this.surface.height), Colors.black)
        if (this._img) {
            this.surface.drawZoom(this._img, new Vector2D(0, 0), 2)
            this.drawSelected()
        }

        this.drawMouse(this.mouse)
    }

    drawSelected() {
        for (const rect of this.atlas) {
            this.surface.drawStrokeRect(new Vector2D(rect.x * this.zoomedGrid.x, rect.y * this.zoomedGrid.y), this.zoomedGrid, Colors.yellow)
        }
    }

    drawMouse(mouse: MouseHandler) {
        if (!mouse.available) return

        const lockedCoords = this.lockedMousePos

        this.surface.context.strokeStyle = 'red'
        this.surface.context.strokeRect(lockedCoords.x * this.zoomedGrid.x, lockedCoords.y * this.zoomedGrid.y, this.zoomedGrid.x, this.zoomedGrid.y)

        this.surface.drawText(`(${lockedCoords.x}, ${lockedCoords.y})`, new Vector2D(5, 5), Colors.white)
    }

    onSelectSprite(fn: (rect: Rect) => void) {
        this._selectFn = fn
    }

    public get lockedMousePos() {
        const lockedCoords = {
            x: Math.floor(( this.mouse.mousePos.x + 3) / this.zoomedGrid.x),
            y: Math.floor(( this.mouse.mousePos.y + 3) / this.zoomedGrid.y)
        }
        return lockedCoords
    }

    public get zoomedGrid() {
        return new Vector2D(this.gridWidth * 2, this.gridHeight * 2)
    }
}

const spriteSheetViewer = new SpritesheetViewer()

spriteSheetViewer.onSelectSprite((rect: Rect) => {
    for (const sprite of props.atlas) {
        if (rect.x === sprite.x && rect.y === sprite.y) {
            emits('sprite:delete', rect)
            return
        }
    }
    emits('sprite:add', rect)
})

watch(
    () => props.image,
    () => {
        spriteSheetViewer._img = props.image
        spriteSheetViewer.draw()
    }
)

let requestId: number

const render = () => {
    spriteSheetViewer.atlas = props.atlas
    spriteSheetViewer.draw()
    requestId = requestAnimationFrame(render)
}

onMounted(() => {
    if(!target.value) return
    spriteSheetViewer.attachSurface(target.value)

    render()
})

onUnmounted(() => {
    if (requestId) cancelAnimationFrame(requestId)
})
</script>

<template>
    <div ref="target"></div>
</template>
