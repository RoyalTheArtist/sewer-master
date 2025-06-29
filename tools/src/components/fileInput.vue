<script setup lang="ts">
import { getFileInputAs } from '@modules/utils/files';
import { ref, useTemplateRef } from 'vue'

defineOptions({
    inheritAttrs: false
})

interface IFileInput {
    label?: string
}

defineProps<IFileInput>()


const loadTiles = useTemplateRef('loadTiles')

const onBrowse = () => {
    loadTiles.value?.click()
}

const file = ref(null as File | null)
</script>

<template>
    <slot name="activator" @click="onBrowse">

    </slot>
    <label for="input-file">
        <input type="text" name="input-file" readonly :value="file?.name" :placeholder="`${$attrs['placeholder'] || ''}`" @click="onBrowse">
    </label>
    <input type="file" ref="loadTiles" class="display-none" :accept="`${$attrs['accept']}`" @change="$attrs.onChange">

</template>

<style scoped>
    input[readonly] {
        outline: none;
        cursor: pointer;
        border: none;
    }
</style>
