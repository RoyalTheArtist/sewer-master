<script setup lang="ts">
import TileSetLoader from '../../modules/tileset/tileSet.loader.vue'
import { createEmptyMap } from "@modules/map/map.utils";
import MapView from "../../modules/mapmaker/components/MapView.vue";
import { Vector2D } from "@engine/utils";

const map = createEmptyMap(new Vector2D(10, 10));
</script>

<template>
  <h3>Create Map</h3>
  <map-view :map="map"></map-view>
  <h3>Tile Set</h3>
  <tile-set-loader></tile-set-loader>
</template>
