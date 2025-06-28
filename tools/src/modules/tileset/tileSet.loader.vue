<script setup lang="ts">
import FileInput from '@/components/fileInput.vue'
import { getFileInputAs } from '@/utils/files';
import { AssetManager } from 'bt-engine/assets';

type MapLoadData = {
    tileset: string,
    meta: {},
    layout: number[],
    legend: {}
}

const handleLoad = async (elem: HTMLInputElement) => {
    const mapData = await getFileInputAs<MapLoadData>(elem);
    return mapData
}

const onChange = async (event: Event) => {
    console.info(event)
    const load = await handleLoad(event.target as HTMLInputElement)
    console.log(load)
    const spriteSheet = AssetManager.loadSpritesheet(load.value.spritesheet.resource)
}
</script>

<template>
    <section id="tileset-loader" class="flex-col">
        <h2>Tileset Info</h2>
        <header>
            <file-input placeholder="Load Tileset" @change="onChange" accept=".json,text/json" ></file-input>
        </header>
        <section class="properties">
            <h3>Details</h3>
            <label for="width">Width
                <input type="number" value="10" name="width">
            </label>
            <label for="height">Height
                <input type="number" value="10" name="height">
            </label>
        </section>
        <div class="preview"></div>
    </section>
</template>
