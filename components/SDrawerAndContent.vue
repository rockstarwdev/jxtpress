
<template>

    <div class="card flex gap-1 sm:block ">
        <div class="w-1/3 pr-2 pocket sm:w-full pocket">
            <div class="pocket-wrap">

                <slot name="pocket"></slot>
            </div>
        </div>
        <div class="w-2/3 content sm:w-full sm:mt-5">
            <div class="content-wrap h-full">

                <slot name="content"></slot>
            </div>
        </div>
    </div>

</template>
<script setup>
import { useSlots, useAttrs } from 'vue'
const props = defineProps({
  color: {
    type: String,
    default: 'black'
  }
})
const emit = defineEmits(['change','delete'])
</script>
<style scoped>
.pocket {
    border-right: 1px solid var(--gray-300);
}
</style>