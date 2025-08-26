<script setup lang="ts">
const props = defineProps<{
  /** Label for the button **/
  label: string
}>()
</script>

<template>
  <button type="button" class="theme-btn">{{ props.label }}</button>
</template>
