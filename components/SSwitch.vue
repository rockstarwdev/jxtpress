
<template>
    <div class="inline-flex gap-2 items-center">
      <label class="switch">
          <input type="checkbox" v-model="d"  ref="input">
          <span class="slider round"></span> 
      </label>
      <span><slot></slot></span>
  </div>
</template>
<script setup>
import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util';
const props = defineProps({

  modelValue: {  type: null,   default: ''  },
  color: {   }
})
console.log ("Props",props, props.modelValue)
const emit = defineEmits(['change','delete'])
const d = useModel(props,emit);
var init_val = props.modelValue;
if ( init_val.toLowerCase) init_val = init_val.toLowerCase().trim()

if ( init_val == 1 || init_val == '1' || init_val == 'yes' || init_val=='true' )init_val = true 
else init_val = false;

d.value = init_val 

const input = ref(null)
onMounted(()=>{
  input.value.checked = init_val
})
  

</script>
