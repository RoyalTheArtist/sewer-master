<script setup lang="ts">

</script>

<template>
  <div class="px-md">
    <header>
      <h1>Tools</h1>
    </header>
    <main class="container flex-col gap-sm">
      <RouterView />
    </main>
  </div>
</template>

<style>
  .hidden {
    visibility: hidden;
  }
</style>
