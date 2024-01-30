
<template>
  <header class="frontend-bar dark" >

    <div class=" container mx-auto p-3" v-if="cur_user">
        <nuxt-link :to="'/user'">Dashboard</nuxt-link>
        <div class="user">
            <span class="user">  {{ cur_user.name }}</span>
        </div> 
    </div>
    
    <slot />
  </header>
</template>
<script setup>
import { useSlots, useAttrs } from 'vue'
import { useMainStore } from '~/store'
const props = defineProps({
  color: {
    type: String,
    default: 'black'
  }
})
let store = useMainStore()
let cur_user = computed(()=>{
    var user = store.rendered_post.current_user 
    return user 
})
const emit = defineEmits(['change','delete'])
</script>
