<script setup lang="ts">
import FileInput from '../../components/fileInput.vue'
import { useRouter } from 'vue-router';
import { GameMap, loadMapFromFile } from '@modules/map';
import MapMakerPage from './MapMakerPage.vue';
import { ref } from 'vue';
import type { TileSet } from '@modules/assets/tiles';
import { Vector2D } from '@engine/utils';
import { createEmptyMap } from "@modules/map/map.utils";

const router = useRouter()

const map = ref<GameMap | null>(null)
const tileset = ref<TileSet | null>(null)

const loadMap = async (event: Event) => {
  //const load = await handleLoad<MapLoadData>(event.target as HTMLInputElement)

  //const mapData = load.value
  const mapData = await loadMapFromFile(event.target as HTMLInputElement)
  console.info(mapData)

  map.value = mapData.map
  tileset.value = mapData.tileset
}

const newMap = () => {
  map.value = createEmptyMap(new Vector2D(10, 10));
  tileset.value = null
}

// NOTE TO SELF
// You intend to work on the File System API for loading maps
// https://developer.mozilla.org/en-US/docs/Web/API/File_System_API
// 6/28/2025

// let fileHandle = null

// const loadMapFS = async () => {
//   [fileHandle] = await window.showOpenFilePicker()
//   const file = await fileHandle.getFile()
//   const data = await getFileInputAs<MapLoadData>(file)


//   const mapData = await loadMapFromData(data.value)
//   console.info( mapData )
// }
</script>

<template>
    <h2>Map Maker</h2>
    <section class="toolbar">
      <button type="button" @click="newMap">New</button>
      <!-- <button type="button" @click="loadMapFS">Load Map</button> -->
      <file-input label="Load" @change="loadMap" accept=".json,text/json" ></file-input>
    </section>
    <map-maker-page v-if="map" :map="map" :tileset="tileset"></map-maker-page>
</template>
