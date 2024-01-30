
<template>
  <div  class="ui s-text    " :class="[$slots.prefix?'prefix':'']">

 
      <textarea   v-model="d"  class="w-full " :placeholder="placeholder" :style="{ height : height, width: '100%'}"> </textarea>
 
  </div>

</template>
<script setup>


const props = defineProps({
  modelValue: {  type: null,   default: ''  },
  placeholder : { type: String, default : ''},
  height : { type : String, default : null }
})

const emit = defineEmits(['change', 'update:modelValue' ])
const d = useModel(props,emit);

</script>
