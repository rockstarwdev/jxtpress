
<template>
  <div  class="ui s-input    " :class="[$slots.prefix?'prefix':'']">
      <template v-if="$slots.prefix">
        <span class="prefix flex items-center">
          <slot name="prefix"></slot>
        </span>
        
      </template>
      
      <template v-if="is_array">
        <span class="item" v-for="(item,item_index) in d" :key="item">
          <span>{{ item }}</span> 
          <span  @click="hnd_remove_item(item_index)" class="remove ml-1 pointer"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="cursor w-3 h-3">
            <path stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></span>
        </span>
      </template>
      
      
      <input @input="hnd_tmp_value_changed" v-if="!is_array" 
      class="flex-1" v-model="temp_value"  :type="type" :placeholder="placeholder" >  
      <input v-else class="flex-1" v-model="text_typed" type="text" @keydown="hnd_text_keydown" :placeholder="placeholder">
 
  </div>

</template>
<script setup>


const props = defineProps({
  modelValue: {  type: null,   default: ''  },
  type : { type: String, default : 'text'} ,
  digits : { type: Number, default : null },
  placeholder:{type: String }
})
const text_typed = ref("")
const emit = defineEmits(['change', 'update:modelValue' ])
const d = useModel(props,emit);
const temp_value = ref(d.value )
const is_array = computed(()=>{
  return Array.isArray(d.value)
})
watch( d  , (new_val)=>{
  temp_value.value = new_val
})

let hnd_tmp_value_changed = ()=>{
  var val = temp_value.value 
  if ( props.type == 'number') {
    val = Number.parseFloat(val);
    if ( isNaN(val)) val = 0 
  } 
  d.value = val 
}
let hnd_text_keydown = (e)=>{
  if ( !is_array.value) return; 
  if ( e.keyCode == 13){//Enter
    var found =false, it = null, typed = text_typed.value.toLowerCase()
    for ( var i=0; i < d.value.length; i++){
      it = d.value[i].toLowerCase();
      if ( typed == it ) {
        found = true; break; 
      }
    }

    if ( ! found ) {
      d.value.push( text_typed.value )
      text_typed.value = "";
    }
  }
  if ( e.keyCode == 8 || e.keyCode == 46){//delete and backbpace
    if (d.value.length> 0){
      if ( text_typed.value.length==0){
        d.value.splice(d.value.length-1,1)
      }
    }
  } 
}
let hnd_remove_item =(index)=>{
  if ( ! is_array.value) return; 
  d.value.splice(index, 1)
}

</script>
<style scoped>
.s-input .item {
  padding: 0.25em;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--gray-300);
  border-radius: 3px;
  margin: 3px;
  margin-right: 3px;
}
.s-input .item .remove {
  visibility: hidden;
}
.s-input .item:hover .remove {
  visibility: visible;
}
.s-input .item:hover .remove:hover {
  stroke: var(--red-500);
  fill: var(--red-500);
}
</style>
