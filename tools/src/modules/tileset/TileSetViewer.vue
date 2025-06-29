<script setup lang="ts">
import { TileSet } from '@modules/assets/tiles';
import { computed } from 'vue';

const props = defineProps<{
  tileset: TileSet
}>()

const tilesForView = computed(() => {
  if (!props.tileset) return []
  return Array.from(props.tileset.tiles.values())
    .filter(tile => tile.appearance?.sprite !== undefined)
    .map(tile => {
      if (!tile.appearance?.sprite) return
      const img = props.tileset.getTileImage(tile.appearance.sprite as string)
      return {
        img,
      }
    }).filter(tile => tile !== undefined)
})

</script>

<template>
  <div class="tiles" v-if="tileset">
    <div class="tile" v-for="tile in tilesForView" :key="tile.toString()">
        <img v-if="tile.img" :src="tile.img.src" alt="tile">
    </div>
  </div>
</template>
