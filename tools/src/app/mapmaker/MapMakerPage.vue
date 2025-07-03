<script setup lang="ts">
import type { Tile } from '@modules/tiles';
import MapView from '../../modules/mapmaker/components/MapView.vue';
import TileSetView from '../../modules/tileset/TileSetView.vue';
import { ref } from 'vue';
import type { GameMap} from '@modules/map/map';

const props = defineProps<{ map: GameMap }> ()

const activeTile = ref<Tile | null>(null)
</script>

<template>
  <map-view :map="props.map" :activeTile="activeTile"></map-view>
  <h3>Tile Set</h3>
  <!-- <tile-set-loader @tileset:loaded="tileset = $event"></tile-set-loader> -->
  <tile-set-view v-if="props.map.tileMap" :tileMap="props.map.tileMap" @tile:selected="activeTile = $event"></tile-set-view>
</template>
