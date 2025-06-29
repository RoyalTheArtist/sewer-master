<script setup lang="ts">
import { createEmptyMap } from "@modules/map/map.utils";
import { Vector2D } from "@engine/utils";
import { ref } from 'vue';
import type { TileSet } from '@modules/assets/tiles';
import MapMakerPage from './MapMakerPage.vue';

const map = createEmptyMap(new Vector2D(10, 10));
const tileset = ref<TileSet | null>(null)
</script>

<template>
  <h3>Create Map</h3>
  <map-maker-page :map="map" v-model:tileset="tileset"></map-maker-page>
</template>
