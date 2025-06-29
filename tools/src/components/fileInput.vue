<script setup lang="ts">
import { getFileInputAs } from '@modules/utils/files';
import { ref, useTemplateRef } from 'vue'

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
      <button type="button" @click="onBrowse">{{props.label}}</button>
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
