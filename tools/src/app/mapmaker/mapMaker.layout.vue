<script setup lang="ts">
import FileInput from '../../components/fileInput.vue'
import { getFileInputAs } from '@/utils/files';
import { AssetManager } from '../../../../modules/assets/manager';
import { useRouter } from 'vue-router';
const assetManager = new AssetManager()
    const router = useRouter()


type MapLoadData = {
  meta: {
    name: string,
    tileset: string
  },
  layout: number[],
  legend: string[]
}



const handleLoad = async (elem: HTMLInputElement) => {
    const tileSetData = await getFileInputAs<MapLoadData>(elem);
    return tileSetData
}

const loadTileSet = async (data: string) => {
  const tileSetData = await assetManager.loadTileSetFrom(data)
  return tileSetData
}

const loadMap = async (event: Event) => {
  console.info(event.target)
  const load = await handleLoad(event.target as HTMLInputElement)
  console.log(load.value)
  const mapData = load.value
  const tileSet = await loadTileSet(mapData.meta.tileset)
  console.log(tileSet)
}

const newMap = () => {

    router.push('/mapmaker/new')
}
</script>

<template>
    <h2>Map Maker</h2>
    <button type="button" @click="newMap" >New Map</button>
    <file-input placeholder="Load Map" @change="loadMap" accept=".json,text/json" ></file-input>
    <!--  -->
    <router-view></router-view>
</template>
