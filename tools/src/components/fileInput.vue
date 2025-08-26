<script setup lang="ts">
import { handleLoad } from '@modules/utils/files';
import { ref, useTemplateRef } from 'vue'
import AppButton from './AppButton.vue';

defineOptions({
    inheritAttrs: false
})

const props = withDefaults(defineProps<{ label: string }>(), {
    label: "Browse"
})


const loadTiles = useTemplateRef('loadTiles')

const onBrowse = () => {
    loadTiles.value?.click()
}

const file = ref(null as File | null)
</script>

<template>
    <slot name="activator" @click="onBrowse">
      <app-button type="button" @click="onBrowse" :label="props.label"></app-button>
    </slot>
    <input type="file" ref="loadTiles" class="display-none" :accept="`${$attrs['accept']}`" @change="$attrs.onChange">

</template>

<style scoped>
    input[readonly] {
        outline: none;
        cursor: pointer;
        border: none;
    }
</style>
