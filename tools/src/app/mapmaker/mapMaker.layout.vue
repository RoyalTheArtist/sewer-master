<script setup lang="ts">
import FileInput from '../../components/fileInput.vue'
import MapMakerPage from './MapMakerPage.vue';
import { ref } from 'vue';
import { generateEmptyMap, generateMap } from '@modules/map/utils';
import type { GameMap, MapGenerationData } from '@modules/map/map';
import { handleLoad } from '@modules/utils/files';

const map = ref<GameMap | null>(null)

const loadMap = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files) throw new Error('No file selected')
  const load = await handleLoad<MapGenerationData>(input.files[0] as File)

  map.value = await generateMap(load.value)
}

const newMap = () => {
  const mapTest = generateEmptyMap(25, 25)
  map.value = mapTest
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
    <map-maker-page v-if="map !== null" :map="map"></map-maker-page>
</template>
