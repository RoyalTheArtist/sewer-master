<script setup lang="ts">
import type { TileSet } from '@modules/assets/tiles';
import TileBench from './TilesBench.vue';
import { computed } from 'vue';

const props = defineProps<{ tileset: TileSet }>()

const previewImg = computed(() => props.tileset.spritesheet.texture.image)
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
    <div class="active-tile card">
      <header class="card-header">
        <h3>Active Tile</h3>
        <div class="tile" style="background-color: white"></div>
        <label for="name">Tile Name:
          <input type="text" name="name" value="white">
        </label>
      </header>
      <section class="card-body" >
        <h3>Properties</h3>
        <label for="passable" class="checkbox-label">
          Passable
          <input type="checkbox" name="passable">
        </label>
        <label for="passable" class="checkbox-label">
          Transparent
          <input type="checkbox" name="transparent"></label>
      </section>
    </div>
    <tile-bench class="card"
      :tileset="tileset"></tile-bench>
  </main>
</template>
