<script setup lang="ts">
import { GameMap } from "@modules/map"
import { makeViewport } from "@engine/render"
import { onMounted, useTemplateRef } from "vue";
import { MapViewScreen } from "../mapViewScreen";

const props = defineProps<{ map: GameMap }>()

const viewPort = makeViewport(800, 600)

const mapViewContainer = useTemplateRef('map-view')
viewPort.setResolution(800, 600)

const mapViewScreen = new MapViewScreen(viewPort, props.map)

onMounted(() => {
  if (!mapViewContainer.value) return
  mapViewContainer.value.appendChild(viewPort.surface.canvas)
  mapViewScreen.start()
})
</script>

<template>
  <div id="map-view" class="bg-black grid-map" ref="map-view"></div>
</template>
