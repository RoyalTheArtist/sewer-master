<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from "vue";
import { useMapView } from "../mapViewScreen";
import type { Tile } from "@modules/tiles";
import type { GameMapRW as GameMap} from "@modules/rewrites/map";

const props = defineProps<{ map:GameMap, activeTile: Tile | null }>()
const mapViewContainer = useTemplateRef('map-view')
const mapView = useMapView(800, 600, props.map)

onMounted(() => {
  mapView.initialize(mapViewContainer.value as HTMLElement)
  mapView.setMap(props.map)
  mapView.start()
})

watch(
  () => props.map,
  () => {
    mapView.setMap(props.map)
  }
)

watch(
  () => props.activeTile,
  () => {
    mapView.setActiveTile(props.activeTile)
  }
)
</script>

<template>
  <div id="map-view" class="bg-black grid-map" ref="map-view"></div>
</template>
