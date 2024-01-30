
<template>
  <div class="ui s-pagination"  >
 
    <ul class="pagination">
        <li class="item" v-for="(p,index) in pagination" :class="p.section"
            :key="p.p+index" @click="hnd_clicked_on_item(p)">
            <template v-if="p.empty">
                {{ p.p }}
            </template>
            <template v-else>
                <template v-if="url">
                    <nuxt-link :to="url+`?limit=${options.limit}&p=${p.p}`">{{ p.p }}</nuxt-link>
                </template>
                <template v-else>
                    <span>{{ p.p }}</span>
                </template>
            </template>
        </li>
    </ul>
  </div>
</template>
<script setup>
import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util'
const props = defineProps({
  options: {
    type: Object,  
  },
  url : { type : String, default : null }
})

const pagination = computed(()=>{
    return util.expand_pagination(props.options)
})
let hnd_clicked_on_item = ( p )=>{
    if ( p.empty ) return ;
    emit ('click', p);
}

const emit = defineEmits(['change','delete','click'])
</script>
