
<template>
    <div class="s-checkbox component" :class="[d ? 'checked': '']" ref="root" @change="hnd_data_changed"  >
        <input type="checkbox" v-model="d" >
        <label class="checkbox" @click="hnd_click"></label>
        <label class="label"  @click="hnd_click" ><slot></slot></label>
    </div>
</template>


<script setup>
import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util';
const props = defineProps({

  modelValue: {  type: null,   default: ''  },
  color: {   }
})
const emit = defineEmits(['change','delete', 'update:modelValue', 'click','select'])
const d = useModel(props,emit);

const root = ref(null)
onMounted(()=>{
    var chk = root.value.querySelector("input");
    var val = d.value;
    if ( val == null ) d.value = false  
    //if ( ['true', true, 1,'yes']) d.value = true 
    //if ( ['false','no',false,0,-1])d.value = false 
    chk.checked = d.value 
})

let hnd_click = (e)=>{
    var input = root.value.querySelector("input");
    input.click() 
    console.log ( input.checked )
    e.preventDefault();
    e.stopPropagation()  
    //d.value = ! d.value  
    
    emit('select')
}
let hnd_data_changed = (e)=>{
    e.preventDefault()
    e.stopPropagation() 
    var new_data =  e.target.checked 
  
    d.value = new_data 
}
</script>
