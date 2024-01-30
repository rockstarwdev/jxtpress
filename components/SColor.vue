
<template>

    <div role="button" class="color-picker"  :value="d" ref="root" @change="hnd_data_changed">
          
        <span class="color" :style="{ backgroundColor : d }"></span>
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
 
})



let hnd_data_changed = (e)=>{
    e.preventDefault()
    e.stopPropagation()
    if ( !e.detail) return; 

    var new_data = e.detail.value ; 
    d.value = new_data 
}
</script>
