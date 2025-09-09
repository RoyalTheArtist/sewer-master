<script setup lang="ts">
import type { TileMap, TileSprite } from '@modules/tiles/tile';
import { computed, ref, watch } from 'vue';



const emit = defineEmits<{
  (e: 'tile:selected', value: { tile: TileSprite, img: HTMLImageElement | undefined }): void
}>()


const props = defineProps<{
  tileMap: TileMap
}>()

const tilesForView = computed(() => {
  if (!props.tileMap) return []
  const tilesForView = props.tileMap.tiles
    .map(tile => ({
        tile: tile,
        img: tile.graphic?.getSprite()?.img || undefined
      }))
  return tilesForView
})

const selectedTile = ref<TileSprite | null>(null)

const selectTile = (tile: { tile: TileSprite, img: HTMLImageElement | undefined }) => {
  selectedTile.value = tile.tile
  emit('tile:selected', tile)
}


</script>

<template>
  <section>
    <h3>Tiles</h3>
    <div class="tools">
      <button type="button" class="add-tile">Paint</button>
      <button type="button" class="fill-tile">Fill</button>
    </div>
    <div class="tiles" v-if="tileMap">
      <div class="tile" :class="{ 'selected': selectedTile === tile.tile }" v-for="tile in tilesForView" :key="tile.toString()" @click="selectTile(tile)" >
          <img v-if="tile.img" :src="tile.img.src" alt="tile">
      </div>
    </div>
  </section>

</template>
