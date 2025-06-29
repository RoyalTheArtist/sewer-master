<script setup lang="ts">
import FileInput from '../../components/fileInput.vue'
import TileSetViewer from './TileSetViewer.vue';
import { getFileInputAs } from '../../utils/files';
import { loadTileSetByDefinition, TileSet, type TileSetData } from '@modules/assets/tiles';
import { computed, ref } from 'vue';

const handleLoad = async (elem: HTMLInputElement) => {
    const mapData = await getFileInputAs<TileSetData>(elem);
    return mapData
}

const tileset = ref<TileSet | null>(null)

const previewImg = computed(() => tileset.value?.spritesheet.texture.image)

const onChange = async (event: Event) => {
  const load = await handleLoad(event.target as HTMLInputElement)

  tileset.value = await loadTileSetByDefinition(load.value)
  console.info(tileset.value)
}

</script>

<template>
    <section id="tileset-loader" class="flex-col">
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
        <main id="mapmaker">
          <section id="tileset" class="grid-tiles">
            <h3>Tile Details</h3>
            <h3>Tile Set</h3>
            <div></div>
            <div class="tools">
                <button type="button" class="add-tile">Paint</button>
                <button type="button" class="fill-tile">Fill</button>
            </div>
            <div id="tile-info" class="tile-info" v-if="false">
                <div class="active-tile">

                    <header class="flex align-end gap-xs">

                        <div class="tile" style="background-color: white"></div>
                        <label for="name">Tile Name:
                            <input type="text" name="name" value="white">
                        </label>
                    </header>
                    <section class="properties flex-col gap-xs" >
                        <h3>Properties</h3>
                        <label for="passable" class="checkbox-label">
                            Passable
                            <input type="checkbox" name="passable">
                        </label>
                        <label for="passable" class="checkbox-label">
                            Transparent
                            <input type="checkbox" name="transparent"></label>
                    </section>
                </div>
            </div>
            <tile-set-viewer v-if="tileset !== null" :tileset="tileset"></tile-set-viewer>
        </section>
        </main>

        <div v-if="previewImg" class="preview" ref="preview">
          <img :src="previewImg.src" alt="preview">
        </div>
    </section>
</template>
