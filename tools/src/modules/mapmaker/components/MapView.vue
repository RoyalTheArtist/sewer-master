<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from "vue";
import { useMapView } from "../mapViewScreen";
import type { Tile } from "@modules/tiles";
import type { GameMap} from "@modules/map/map";

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
  <div id="map-view" class="bg-black grid-map" >
    <section class="toolbar">
      <button class="btn-icon" type="button">
        <span class="material-symbols-outlined">
          brush
        </span>
      </button>
      <button class="btn-icon" type="button">
        <span class="material-symbols-outlined">
          format_color_fill
        </span>
      </button>
      <button class="btn-icon" type="button">
        <span class="material-symbols-outlined">
          diagonal_line
        </span>
      </button>
      <button class="btn-icon" type="button">
        <span class="material-symbols-outlined">
          rectangle
        </span>
      </button>
    </section>
    <section ref="map-view">
    </section>
  </div>
</template>

<style lang="scss" scoped>
.grid-map {
  display: flex;
}

.toolbar {
  flex-direction: column;
}
</style>
