
<template>

    <div class="date" ref="root" @change="hnd_data_changed" :value="d">
        
        <div class="selected">
            <span class="value">{{ d  }}</span>
        </div>
 
    </div>
</template>
<script setup>
import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util';
const props = defineProps({
  has_time : { type : Boolean, default: true }, 
  modelValue: {  type: null,   default: ''  },
  color: {   }
})
const emit = defineEmits(['change','delete', 'update:modelValue'])
const d = useModel(props,emit);

d.value = props.has_time ? util.format_mm_dd_yyyy_hh_mm(d.value ):util.format_mm_dd_yyyy (d.value )
const root = ref(null)
onMounted(()=>{
 
})


 
let hnd_data_changed = (e)=>{
    e.preventDefault()
    e.stopPropagation() 
    if ( !e.detail) return; 

    var new_data = e.detail.value ; 
    d.value = new_data 
    
}
</script>
