<script setup lang="ts">
import FileInput from '../../components/fileInput.vue'
import { useRouter } from 'vue-router';
import { GameMap, loadMapFromFile } from '@modules/map';
import MapMakerPage from './MapMakerPage.vue';
import { ref } from 'vue';
import type { TileSet } from '@modules/assets/tiles';

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
    router.push('/mapmaker/new')
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
    <router-view></router-view>
    <map-maker-page v-if="map" :map="map" :tileset="tileset"></map-maker-page>
</template>
