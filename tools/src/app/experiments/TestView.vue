<template>
  <header class="container pa-none surface surface-beige">
    <h1 class="surface surface-dark-slate">Bone Torch Tools</h1>
    <nav class="toolbar surface surface-burnt-orange">
      <router-link to="/test" class="highlight">Map Maker</router-link>
      <router-link to="?test=two">Monster Maker</router-link>
      <router-link to="?test=three">Tilesets</router-link>
    </nav>
    <ul class="toolbar">
      <li><button type="button" @click="saveMap">Save Map</button></li>
      <li><button type="button" @click="loadMap">Load Map</button></li>
      <li><button type="button" @click="newMap">New Map</button></li>
    </ul>
  </header>
  <main class="container pa-none surface surface-beige">
    <section class="surface surface-black"></section>
  </main>
  <footer class="surface surface-beige">
    <section class="container pa-none">
      <h3>Tilesest</h3>
    </section>
  </footer>
</template>

<style lang="scss">


</style>
