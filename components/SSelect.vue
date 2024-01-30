
<template>
  <div  class="ui s-select select" :class="[d_is_array ? 'is-array': '']" :value="d_json" 
    @remove="hnd_remove_item" @select="hnd_rethrow_select"
     > 
 
    <div class="selected">
        
        <template v-for="val in d_forced_arr" :key="val">
            <template v-if="val != null">


                <span  :value="val">
                    <template v-if="$slots.selected">
                        <slot name="selected" :value=" val_to_option ( val)"></slot>
                    </template>
                    <template v-else>
                        {{  option_text ( val_to_option ( val))  }}
                    </template>
                    
                </span>  
            </template>
        </template>
        
    </div>
    <ul class="values" >
        
        <template v-if="$slots.default">
            <li v-for="(opt, oi) in values "  :key="option_value(opt)+ '_'+oi" @click="hnd_select_item(option_value(opt),$event)"  >
                <slot :value="opt" ></slot>
          
            </li>
        </template>
        <template v-else>
            <li v-for="(opt, oi) in values "  :key="option_value(opt)+ '_'+oi" @click="hnd_select_item(option_value(opt),$event)">
            {{  option_text (opt)  }}  
            </li>

        </template> 
    </ul>
  </div>
</template>
<script setup>
import util from "~/assets/js/util"


const props = defineProps({
  modelValue: {  type: null,   default: ''  },
  type : { type: String, default : 'text'} ,
  values : { type : Array , default : ()=> [] }
})
onMounted(()=>{
    util.initialize_all_select();
})

const text_typed = ref("")
const emit = defineEmits(['change', 'update:modelValue', 'select' ])
const d = useModel(props,emit);
const is_array = computed(()=>{
  return Array.isArray(d.value)
})

let option_value = computed (()=>{
    return (opt)=>{
        var o = opt.id || opt.value || opt.command || opt  ;
        
        var keys = Object.keys( opt)
        if ( keys.includes("id") &&  opt.id == null){
            o = null; 
        }
        if ( keys.includes("value") &&  opt.value == null){
            o = null; 
        }
        
        return o
    }
})
let option_text = computed (()=>{
    return (opt)=>{
        var out =  opt.title || opt.name 
        if ( out === null ) {
            out = "Empty"
        } 
 
        return out 
        
    }
})

let hnd_remove_item = (e)=>{
    let val = e.detail.value;  
    if ( d_is_array.value ) {
        var index = d.value.indexOf(val);
        d.value.splice(index,1);
    }else {
        d.value = '';
    }
}
let hnd_select_item = (val,e)=>{ 
    e.stopPropagation()
    if ( d_is_array.value ) {
        var index = d.value.indexOf(val); 
        if ( index == -1 )  d.value.push(val);
    }else {
        d.value = val;
    }
    //emit('change', val )
    emit('update:modelValue', val )
    hnd_rethrow_select(null , val )
}

let val_to_option = computed(()=>{
    return (val)=>{
        var it =null;
        var values = props.values || []
        for (var i=0; i < values.length; i++){
            it = option_value.value(values[i])
            
            if ( it == val ) {
                return values[i]
            }
        }
        return {}
    }
})
let hnd_rethrow_select = (e, value )=>{
    if (e && ! e.detail){ 
        e.preventDefault();
        e.stopPropagation();
    } 
    emit('select', value )
}
let d_is_array = computed(()=>{
    return Array.isArray(d.value)
})
let d_forced_arr = computed(()=>{
    if ( d_is_array.value ) {
        return d.value; 
    }else {
        return [d.value ]
    }
})
let d_json = computed(()=> JSON.stringify(d.value))

</script>
<style scoped>
 
</style>
