
<template>
    <div class="s-meta meta-box" ref="root" @change="hnd_data_changed"  @value-field-change="hnd_value_field_change">
        <input class="name" type="text" v-model="d.name" @focus="hnd_force_refresh">
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
onMounted((e)=>{
    hnd_force_refresh()
})

let hnd_force_refresh = ()=>{
    var root_el = root.value  
    var value = d.value.value
    util.trigger("refresh", root_el , { value : value  })
}
 
let hnd_data_changed = (e)=>{
 
    e.preventDefault()
    e.stopPropagation() 
 
}
let hnd_value_field_change = (e)=>{
    var value =e.detail.value ;
    if ( value == undefined || value == 'undefined')return; 

    d.value.value = value 
    d.value = d.value 
    emit('change',d.value )  
}
</script>
