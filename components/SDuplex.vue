
<template>

    <div class="duplex" ref="root" @change="hnd_data_changed">
        <input type="number">
        <select>
            <option v-for="opt in values" :value="opt.value" :key="opt.value">{{ opt.title }}</option>
        </select>
    </div>
</template>
<script setup>
import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util';
const props = defineProps({
  values : { type: Array ,
    default : ()=>{
        return [
            {title :"--",value:"--"},
            {title :"px",value:"px"},
            {title:"em", value :"em"},
            {title:"rem", value :"rem"},
            {title:"%", value :"%"}
        ]
    }
  },
  modelValue: {  type: null,   default: ''  },
  color: {   }
})
const emit = defineEmits(['change','delete', 'update:modelValue'])
const d = useModel(props,emit);

const root = ref(null)
onMounted(()=>{
    var val         = d.value ; 
    var rex         = /(-?[\d+\.]+)([%a-zA-Z0-9\-]+)/;        //ie "32.45px" -> (32.45) and (px)

    var parts       = rex.exec( val )
    if ( parts ) {
        var ie = root.value.querySelector("input")
        var se = root.value.querySelector("select")
        ie.value = parts[1]
        se.value = parts[2]
    } 
})


 
let hnd_data_changed = (e)=>{
    e.preventDefault()
    e.stopPropagation()
    if ( !e.detail) return; 

    var new_data = e.detail.value ; 
    d.value = new_data 
}
</script>
