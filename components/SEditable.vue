
<template>

    <div class="editable border border-gray-300 rounded p-2 bg-white" ref="root" @change="hnd_data_changed"  :style="{minHeight: '50px', width: '100%', minWidth: '100%'}">
    </div>
</template>
<script setup>
import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util';
const props = defineProps({
 
  modelValue: {  type: null,   default: ''  },
  color: {   }
})
const emit = defineEmits(['change','delete', 'update:modelValue'])
const d = useModel(props,emit);

const root = ref(null)
onMounted(()=>{
    util.apply_editable_effects( root.value )
    root.value.innerHTML = d.value
})


 
let hnd_data_changed = (e)=>{
    e.preventDefault()
    e.stopPropagation() 
    if ( !e.detail) return; 

    var new_data = e.detail.value ; 
    d.value = new_data 
}
</script>
