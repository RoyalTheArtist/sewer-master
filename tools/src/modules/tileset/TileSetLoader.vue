<script setup lang="ts">
import FileInput from '../../components/fileInput.vue'
import { loadTileSetFromFile, TileSet } from '@modules/assets/tiles';

const emit = defineEmits<{ (e: 'tileset:loaded', tileset: TileSet): void }>();

const onChange = async (event: Event) => {
  const tileset = await loadTileSetFromFile(event.target as HTMLInputElement)
  emit('tileset:loaded', tileset)
}

</script>

<template>
  <header id="tileset-loader" class="flex-col">
    <file-input label="Load" @change="onChange" accept=".json,text/json" ></file-input>
  </header>
</template>
