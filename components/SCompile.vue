
<template>
  <div class="S-Compile" >
   
    
    <the_compiler />
  </div>
</template>
<script setup>
import { useSlots, useAttrs } from 'vue'
import util from '~/assets/js/util'
import { useMainStore } from '~/store'
const props = defineProps({
    template: {
    type: String,
    default: ''
  }
})
import SComments from './SComments.vue';
import SCheckbox from './SCheckbox.vue';
import SDuplex from './SDuplex.vue';
import SDate from './SDate.vue'
import SLookup from './SLookup.vue';
import SSelect from './SSelect.vue';
import SInput from './SInput.vue';
import STextarea from './STextarea.vue'
import SMeta from './SMeta.vue'
import SSpinner from './SSpinner.vue';
import SSwitch from './SSwitch.vue';
import STable from './STable.vue';
import SRadio from './SRadio.vue';
import SReoccurPicker from './SReoccurPicker.vue';



defineComponent({

})
const emit = defineEmits(['change','delete'])


const store = useMainStore()
 
// 
var post = JSON.parse(JSON.stringify( store.rendered_post ))
if ( ! post ) post = {}
if ( ! post.binding_data ) post.binding_data = {}

// Create empty injectables
var injectable_methods  = {}
var injectable_computed = {}
var injectable_watch    = {}
var injectable_data     = {}
var callable_on_mount  = []
var callable_on_created = []
var callable_on_unmount = []
var callable_on_error = []
var callable_setup = []


let components = {
      SComments, SCheckbox,SDate,SDuplex,SLookup,SSelect,SInput,STextarea,SMeta,
      SSpinner,SSwitch,STable,SRadio,SReoccurPicker,
}

if ( Array.isArray(post.registered_components) ) {
  post.registered_components.forEach( (comp,index) =>{
    let fn_comp = new Function (` return (${comp})()`)
    let comp_obj = null; 
    try{  
      comp_obj = fn_comp();
    }catch( e) {
      store.error("Unable to register component "+  index + " of " + post.registered_components.length + " due to " + e.message )
      return; 
    }
    if ( !comp_obj )  {
      store.error("Unable to register component " + index + " of " + post.registered_components.length + " as null/undefined was returned")
      return ; 

    }
    if ( !comp_obj.name ) {
      store.error("Unable to register component " + index + " of " + post.registered_components.length + " due to un-named component")
      return ; 
    }
    components[comp_obj.name] = comp_obj 

    console.log ('Registered', comp_obj.name , "Component" )
  })
}

if ( post && Array.isArray(post.binding_blocks )){
  var binding = null, option_api
  for ( var i =0; i < post.binding_blocks.length; i++){
    // { id , type, children , data : { option_config, title }  }
    binding = post.binding_blocks[i];
    if ( ! binding || (binding && ! binding.data)) continue; 
    if ( ! binding.data.option_config) continue; 
    option_api = (new Function('return ' + binding.data.option_config))();
    if ( option_api.methods ) {
      injectable_methods = { ... option_api.methods, ... injectable_methods }
    }
    if ( option_api.computed ) {
      injectable_computed = { ... option_api.computed, ... injectable_computed }
    }
    if ( option_api.watch ) {
      injectable_watch = { ... option_api.watch, ... injectable_watch }
    }
    if ( typeof option_api.data == 'function') {
      injectable_data = { ... (option_api.data() || {}), ... injectable_data }
    }
    if ( typeof option_api.onMounted == 'function' ) callable_on_mount.push( option_api.onMounted ) 
    if ( typeof option_api.beforeUnmount == 'function' ) callable_on_unmount.push( option_api.beforeUnmount )  
    if ( typeof option_api.created == 'function' ) callable_on_created.push( option_api.created ) 
    if ( typeof option_api.errorCaptured =='function')callable_on_error.push( option_api.errorCaptured )
    if ( typeof option_api.setup == 'function')callable_setup.push(option_api.setup ) 

  }
}



let the_compiler = defineNuxtComponent({
    name: "TheCompiler",
    template: post.rendered  ,
    components ,
    provide() {
      return {
        useRequest, util, store, 
      }
    },  
    async setup (props, context){
      var ret = null, out = {}
      for(var i=0; i < callable_setup.length; i++){ 
        ret = await callable_setup[i] ( props, context);
        out= { ... out, ... ret }
      }
      return out 
    },
    data() { 
     
       var site  =  post.site
       return {
          ... injectable_data, 
          ... post.binding_data  , //Bind-data was execute and set on server during render_post 
          post , site 
       }
    },
    created (){
      callable_on_created.forEach(it => it())
    },
    mounted (){
      window.__post = post 
      callable_on_mount.forEach(it => it())
    },
    unmounted(){
      callable_on_unmount.forEach(it => it())
    },
    errorCaptured (x) {
      callable_on_error.forEach( it => it(x) )
    },  
    watch: {
      ... injectable_watch
    },
    methods : {
      ... injectable_methods
    },
    computed : {
        ... injectable_computed,
        metas() {
          return (name, def_value = null)=>{
            if ( ! this.post ) return def_value; 
            var arr = this.post.metas || []
            
            var m = arr.find (it =>  it.name == name ); 
            if ( ! m ) return def_value
            return m.value || def_value
          }
        },
        capital_word(){ 
          return (str )=>{ 
              if ( ! str) return "";  
              return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
          }
        },
        capitalize() {
          (sentence, max_length =undefined)=>{ 
            if ( ! sentence) return; 

            var out = sentence.replace(/_/g, ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
            if ( max_length && sentence.length > max_length){
                out = out.substring(0, max_length) + "..";
            }
            return out;
          }
        }
    }
})



</script>
