<script setup lang="ts">
import type { Tile } from '@modules/tiles';
import MapView from '../../modules/mapmaker/components/MapView.vue';
import TileSetLoader from '../../modules/tileset/TileSetLoader.vue';
import TileSetView from '../../modules/tileset/TileSetView.vue';
import { TileSet } from '@modules/assets/tiles';
import type { GameMap } from '@modules/map';
import { ref } from 'vue';

const props = defineProps<{ map: GameMap }> ()

const tileset = defineModel<TileSet | null>('tileset')

const activeTile = ref<Tile | null>(null)
</script>

<template>
  <map-view :map="props.map" :activeTile="activeTile"></map-view>
  <h3>Tile Set</h3>
  <tile-set-loader @tileset:loaded="tileset = $event"></tile-set-loader>
  <tile-set-view v-if="tileset !== null" :tileset="tileset" @tile:selected="activeTile = $event"></tile-set-view>
</template>
