<script setup lang="ts">
import type { TileSet } from '@modules/assets/tiles';
import TileBench from './TilesBench.vue';
import { computed, ref } from 'vue';
import type { Tile } from '@modules/tiles';

const emit = defineEmits<{ (e: 'tile:selected', tile: Tile): void }>();

const props = defineProps<{ tileset: TileSet }>()

const previewImg = computed(() => props.tileset.spritesheet.texture.image)

const activeTile = ref<Tile | null>(null)

const activeTileImg = computed(() => activeTile.value ? props.tileset.getTileImage(activeTile.value.appearance?.sprite || '') : null)

const handleTileSelected = (tile: Tile) => {
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
            <img :src="previewImg.src" alt="preview">
          </div>
         <label for="width">Width
          <input type="number" :value="tileset.spritesheet.width" name="width">
        </label>
        <label for="height">Height
          <input type="number" :value="tileset.spritesheet.height" name="height">
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
          <input type="checkbox" name="passable">
        </label>
        <label for="passable" class="checkbox-label">
          Transparent
          <input type="checkbox" name="transparent"></label>
      </section>
    </div>
    <tile-bench class="card flex-grow-2"
      :tileset="tileset"
      @tile:selected="handleTileSelected"
      ></tile-bench>
  </main>
</template>
