<script setup lang="ts">
import type { TileSet } from '@modules/assets/tiles';
import TileBench from './TilesBench.vue';
import { computed } from 'vue';

const props = defineProps<{ tileset: TileSet }>()

const previewImg = computed(() => props.tileset.spritesheet.texture.image)
</script>

<template>
  <main id="tileset" class="grid-tiles">
    <section class="tileset-details">
      <h3>Details</h3>
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
    <section id="tile-info" class="tile-info" v-if="false">
      <div class="active-tile">
        <header class="flex align-end gap-xs">
          <div class="tile" style="background-color: white"></div>
          <label for="name">Tile Name:
            <input type="text" name="name" value="white">
          </label>
        </header>
        <section class="properties flex-col gap-xs" >
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
    </section>
    <tile-bench
      :tileset="tileset"></tile-bench>
  </main>
</template>
