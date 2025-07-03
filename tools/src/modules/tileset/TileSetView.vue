<script setup lang="ts">
import TileBench from './TilesBench.vue';
import { computed, ref } from 'vue';
import type { Tile } from '@modules/tiles';
import type { TileMap, TileSprite } from '@modules/rewrites/tiles/tile';

const emit = defineEmits<{ (e: 'tile:selected', tile: Tile): void }>();

const props = defineProps<{ tileMap: TileMap }>()

const previewImg = computed(() => props.tileMap.spritesheet.texture.image)

const activeTile = ref<TileSprite | null>(null)

const activeTileImg = computed(() => {
  if (!activeTile.value) return null

  if (!activeTile.value.sprite) return null

  return activeTile.value.sprite.img
})
const handleTileSelected = (tile: TileSprite) => {
  activeTile.value = tile
  emit('tile:selected', tile)
}
</script>

<template>
  <main id="tileset" class="grid-tiles">
    <div class="tileset-details card" v-if="false">
      <header class="card-header">
        <h3>Details</h3>
      </header>
      <section class="card-body" >
            <div v-if="previewImg" class="preview" ref="preview">
              <img :src="(previewImg as HTMLImageElement).src" alt="preview">
            </div>
         <label for="width">Width
          <input type="number" :value="tileMap.size[0]" name="width">
        </label>
        <label for="height">Height
          <input type="number" :value="tileMap.size[1]" name="height">
        </label>
      </section>
    </div>
    <div class="active-tile card max-width-225" v-if="activeTile">
      <header class="card-header">
        <h3>Active Tile</h3>
        <div class="tile" style="background-color: white">
          <img v-if="activeTileImg" :src="activeTileImg.src" alt="preview">
        </div>
      </header>
      <section class="card-body" >
        <h3>Properties</h3>
        <label for="name">Tile Name:
          <input type="text" name="name" value="">
        </label>
        <label for="passable" class="checkbox-label">
          Passable
          <input type="checkbox" name="passable" :checked="activeTile.passable">
        </label>
        <label for="passable" class="checkbox-label">
          Transparent
          <input type="checkbox" name="transparent" :checked="activeTile.transparent"></label>
      </section>
    </div>
    <tile-bench class="card flex-grow-2"
      :tile-map="tileMap" id="tileset"
      @tile:selected="handleTileSelected"
      ></tile-bench>
  </main>
</template>
