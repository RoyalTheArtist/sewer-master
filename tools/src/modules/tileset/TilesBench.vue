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
  <section>
    <h3>Tiles</h3>
    <div class="tools">
      <button type="button" class="add-tile">Paint</button>
      <button type="button" class="fill-tile">Fill</button>
    </div>
    <div class="tiles" v-if="tileset">
      <div class="tile" v-for="tile in tilesForView" :key="tile.toString()">
          <img v-if="tile.img" :src="tile.img.src" alt="tile">
      </div>
    </div>
  </section>

</template>
