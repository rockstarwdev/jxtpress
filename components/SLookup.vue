
<template>

    <div class="lookup" context="posts" :value="d_to_json" ref="root" @change="hnd_data_changed">
          <input type="text" placeholder="Search posts...">
    </div>
</template>
<script setup>
import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util';
const props = defineProps({

  modelValue: {  type: null,   default: ''  },
  color: {   }
})
const emit = defineEmits(['change','delete'])
const d = useModel(props,emit);

const root = ref(null)
onMounted(()=>{
    util.trigger("selected-value", root.value )
})

const d_to_json = computed(()=>{
    if ( typeof d.value == 'function')return null 
    var str = JSON.stringify(d.value);
    return str
})
let hnd_data_changed = (e)=>{
    e.preventDefault()
    e.stopPropagation()
    if ( !e.detail) return; 

    var new_data = e.detail.value ; 
    d.value = new_data
    console.log("Data change occurred", e, e.detail )
}
</script>
