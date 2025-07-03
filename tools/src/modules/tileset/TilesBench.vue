<script setup lang="ts">
import type { TileMap, TileSprite } from '@modules/rewrites/tiles/tile';
import { computed } from 'vue';

const emit = defineEmits<{
  (e: 'tile:selected', tile: TileSprite): void
}>()


const props = defineProps<{
  tileMap: TileMap
}>()

const tilesForView = computed(() => {
  if (!props.tileMap) return []
  const tilesForView = props.tileMap.tiles
    .map(tile => ({
        tile: tile,
        img: tile.sprite?.img || undefined
      }))
  return tilesForView
})

</script>

<template>
  <section>
    <h3>Tiles</h3>
    <div class="tools">
      <button type="button" class="add-tile">Paint</button>
      <button type="button" class="fill-tile">Fill</button>
    </div>
    <div class="tiles" v-if="tileMap">
      <div class="tile" v-for="tile in tilesForView" :key="tile.toString()" @click="emit('tile:selected', tile.tile)" >
          <img v-if="tile.img" :src="tile.img.src" alt="tile">
      </div>
    </div>
  </section>

</template>
