
<template>


    
        <div class="spinner"   @change="hnd_data_changed">
            <input v-model="d" >
            <div class="controls"> 
              <button type="button" class="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
                  stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg> 
              </button>

              <button type="button" class="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
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
 
})


 
let hnd_data_changed = (e)=>{
    e.preventDefault()
    e.stopPropagation() 
    if ( !e.detail) return; 

    var new_data = e.detail.value ; 
    d.value = new_data 
    
}
</script>
