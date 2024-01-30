
<template>

    <div class="radio" >
        <input id="radio-1" v-model="d" :name="name" type="radio" @change="hnd_update_d"  
        :value="option"  >
        <label :for="name" class="radio-label">{{  title  }}</label>
    </div>


</template>
<script setup>
import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util';
const props = defineProps({
    option : { type : String,  default : ''},
    name : { type : String , default : 'radio-name'},
    title : { type : String, default : '' },
    modelValue: {  type: null,   default: ''  },

})
const emit = defineEmits(['change','delete', 'update:modelValue','update'])
const d = useModel(props,emit);
 
let initial_value = ref ( d.value  )

const root = ref(null)
onMounted(()=>{
 
})

let hnd_update_d = (x)=>{
    var new_value = x.target.value 

    d.value = new_value 
}
 

</script>
