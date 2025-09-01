<script setup lang="ts">
import type { Tile } from '@modules/tiles';
import MapView from '../../modules/mapmaker/components/MapView.vue';
import TileSetView from '../../modules/tileset/TileSetView.vue';
import { ref } from 'vue';
import type { GameMap} from '@modules/map/map';

const props = defineProps<{ map: GameMap }> ()

const activeTile = ref<Tile | null>(null)

const sidebarOpen = ref(false)
</script>

<template>
  <div class="view-sidebar">
    <section class="sidebar-left" :class="{ 'open': sidebarOpen }">
      <div class="content">
        <h3>Properties</h3>
        <label for="width">Width
          <input type="number" :value="props.map.width" name="width">
        </label>
        <label for="height">Height
          <input type="number" :value="props.map.height" name="height">
        </label>
      </div>
      <ul class="toolbar-vertical">
        <li>
          <button class="icon" type="button" @click="sidebarOpen = !sidebarOpen">
            <span class="material-symbols-sharp">
              chevron_right
            </span>
          </button>
        </li>
        <li>
          <button class="icon" type="button">
            <span class="material-symbols-sharp">
              map
            </span>
          </button>
        </li>
      </ul>
    </section>
    <map-view class="view-main" :map="props.map" :activeTile="activeTile"></map-view>
  </div>

  <h3>Tile Set</h3>
  <!-- <tile-set-loader @tileset:loaded="tileset = $event"></tile-set-loader> -->
  <tile-set-view v-if="props.map.tileMap" :tileMap="props.map.tileMap" @tile:selected="activeTile = $event"></tile-set-view>
</template>


<style>
  .view-sidebar {
    display: flex;

    .sidebar-left {
      max-width: 32px;
      width: 100%;
      display: flex;
      justify-content: center;

      &.open {
        max-width: 250px;
        justify-content: end;
        gap: 4px;

        .content {
          width: 100%;
        }
      }

      .toolbar-vertical {
        list-style-type: none;
        margin: 0;
        padding: 0;

        display: flex;
        flex-direction: column;
        width: 32px;
        background-color: var(--color-green-forest-dark);


        li {
          margin: 0;
          padding: 0;
          line-height: 1;
        }
      }

      .content {
        max-width: calc(100% - 32px);
        width: 0px;
        overflow: hidden;
      }
    }

    .view-main {
      flex-grow: 2;
    }
  }
</style>
