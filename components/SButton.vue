
<template>
  <button class="ui button  ripple is-dark " >
    <slot />
  </button>
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
