<script setup lang="ts">
import FileInput from '../../components/fileInput.vue';
import TextInput from '../../components/TextInput.vue';
import SpritesheetViewer from '../../modules/spritesheets/SpritesheetViewer.vue';
import type { Rect } from 'bt-engine/utils';
import { ref } from 'vue';

const editImage = ref<HTMLImageElement | null>(null)
const atlas = ref(new Set<Rect>())


const loadImage = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        const image = new Image()
        image.src = URL.createObjectURL(target.files[0])
        editImage.value = image
    }
}

const addSprite = (rect: Rect) => {
    atlas.value.add(rect)
}

const deleteSprite = (rect: Rect) => {
    for(const sprite of atlas.value) {
        if (rect.x === sprite.x && rect.y === sprite.y) {
            atlas.value.delete(sprite)
            return
        }
    }
}
</script>

<template>
    <section>
        <h3>New</h3>
        <FileInput placeholder="Load Image" @change="loadImage" accept=".png"></FileInput>
        <TextInput label="Name" />

        <div class="container" style="max-width: 500px">
            <SpritesheetViewer
                :atlas="atlas"
                :image="editImage"
                @sprite:add="addSprite"
                @sprite:delete="deleteSprite"></SpritesheetViewer>
        </div>

    </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
