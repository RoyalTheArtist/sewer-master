<script setup lang="ts">
import TileBench from './TilesBench.vue';
import { computed, ref } from 'vue';
import type { Tile } from '@modules/tiles';
import type { TileMap, TileSprite } from '@modules/rewrites/tiles/tile';

const emit = defineEmits<{ (e: 'tile:selected', tile: Tile): void }>();

const props = defineProps<{ tileMap: TileMap }>()

const previewImg = computed(() => props.tileMap.spritesheet.texture.image)

const activeTile = ref<{ tile: TileSprite, img: HTMLImageElement | undefined } | null>(null)

const activeTileImg = computed(() => {
  return activeTile.value?.img
})
const handleTileSelected = (value: {tile:TileSprite, img: HTMLImageElement | undefined}) => {
  activeTile.value = value
  emit('tile:selected', value.tile)
}
</script>

<template>
  <section id="tileset" class="grid-tiles">
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
    <div class="active-tile card" v-if="activeTile">
      <header class="card-header">
        <h3>Active Tile</h3>
      </header>
      <section class="tile-preview">
        <div class="tile" style="background-color: white">
          <img v-if="activeTileImg" :src="activeTileImg.src" alt="preview">
        </div>
        <label for="name">Tile Name:
          <input type="text" name="name" :value="activeTile.tile.name">
        </label>
      </section>
      <section class="card-body space-between" >
        <label for="passable" class="checkbox-label space-between">
          Passable
          <input type="checkbox" name="passable" :checked="activeTile.tile.passable">
        </label>
        <label for="passable" class="checkbox-label space-between">
          Transparent
          <input type="checkbox" name="transparent" :checked="activeTile.tile.transparent"></label>
      </section>
    </div>
    <tile-bench class="card flex-grow-2"
      :tile-map="tileMap" id="tileset"
      @tile:selected="handleTileSelected"
      ></tile-bench>
  </section>
</template>
