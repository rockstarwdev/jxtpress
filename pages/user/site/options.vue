<template>
 
    <div class="page">
        
 
        <h1  class="md:flex flex mb-4"> <span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
</svg>
</span> <span class="ml-2">Site Options</span></h1>  

        <div class="flex">
                <s-button class="primary outline" @click="hnd_add_option">Add</s-button>
                <div class="ml-4">
                    <s-input v-model="search_option_name" placeholder="Search options"></s-input>
                </div>
        </div>
        
        <ul class="list border my-3 card ">
            <li v-for="(opt,oi) in filtered_options" :key="opt.name + '_'+oi"  >
                <div v-if="ref_obj_to_edit != opt">
                    <s-button class="pencil flat primary mr-2" @click="hnd_edit(opt)">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg> 
                    </s-button>
                    <span> 
                        {{  opt.name  }}
                    </span>
                </div>
                <div v-else>
                    <div class="flex">
                        <div class="flex flex-col mr-3">
                            <s-button class="flat green check mb-2 success" @click="hnd_save_option">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </s-button>
                            <s-button class="flat red remove danger" @click="hnd_remove_option">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>

                            </s-button>
                            <s-button class="flat button" title="Advanced" @click="hnd_advanced_edit(opt)">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" 
                                stroke="currentColor" class="w-6 h-6 opacity-50">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                </svg>

                            </s-button>
                        </div>
                        <div class="flex-1">
                            <div class="mb-2">
                                <s-input v-model="active_option.name"  class="w-full"></s-input>
                            </div>
                            <div class="mb-2">
                                <s-textarea v-model="active_option.value"   class="w-full"></s-textarea>
                            </div>
                        </div>
                    </div>
             
                </div>
                 
            </li>
        </ul> 

        <div class="advanced-option-editor modal" ref="advanced_modal">
            <div class="wrapper">
                <div class="title">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" 
                        stroke="currentColor" class="w-6 h-6  ">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>

                    <h3>Advanced</h3>
                </div>
                <div class="content" v-if="advance_edit_version" >
                     <s-meta v-model="advance_edit_version"></s-meta>
                     
                </div>
                <div class="footer flex justify-end">
                    <button type="button" class="button modal-cancel">Cancel</button>
                    <button type="button" class="button modal-ok">Ok</button>
                </div>
            </div>
        </div>
    </div>    
</template>

<script setup>
import util from "~/assets/js/util";
import { useMainStore } from "~/store";
 
let advanced_modal = ref(null)


useOnPageReady();


let store = useMainStore() 
const route = useRoute(); //route.params.<NAME>, route.title.<NAME>


definePageMeta({
   layout: "user", //override page layout or use  setPageLayout('custom')
   middleware : [
    "auth",
    async (to, from)=>{
      var store = useMainStore()
      await store.process_post(to,{ native: true})
       //  await store.load_options()
    }
  ]
});

var the_options = ref( [] )

let refresh_options =async  ()=>{
    the_options.value = await store.load_options({  })
    var it ; 
    for ( var i =0; i < the_options.value.length;i++){
        it =the_options.value[i]
        console.log ( typeof it.name , typeof it.value )
        if ( typeof it.value == 'object') {
            it.value = JSON.stringify(it.value)
        }
    }
}
refresh_options()

useHead({
  title: store.rendered_post.title ||"Site Options" ,
  meta: [
    ... store.rendered_post.meta_seo
  ],
  bodyAttrs: {   },
  script: [  
    ... store.rendered_post.head_scripts
  ],
  link : [
    ... store.rendered_post.links 
  ],
  style : [
    ... store.rendered_post.head_style 
  ]
})


let search_option_name = ref("")
let ref_obj_to_edit = ref(null)
let active_option = ref(null)
let advance_edit_version = ref(null)

let hnd_edit = (option)=>{
    ref_obj_to_edit.value = option;
    active_option.value = JSON.parse(JSON.stringify(option))
    advance_edit_version.value = null;  
}
let hnd_save_option = ()=>{ 
    if ( ! active_option.value.value) { 
        if ( active_option.value.name == 'new-option') {
            var index =-1;
            for(var i=0; i < store.options.length; i++){
                if ( store.options[i].name == 'new-option'){
                    index = i; break; 
                }
            } 
            if ( index != -1 ) store.options.splice(index,1)
        }
        return false; 
    }
    //If no changes return immediated
    if ( ref_obj_to_edit.value.name == active_option.value.name && 
         ref_obj_to_edit.value.value == active_option.value.value){
        ref_obj_to_edit.value = null; 
        return false; 
    }
    useRequest({ url: '/api/site/options', method: 'post', body: active_option.value }).then(async ()=>{
        await refresh_options()
        ref_obj_to_edit.value = null; 
        advance_edit_version.value = null; 
 
    })
}
let hnd_remove_option = async ()=>{

    var ret = await util.open_modal({
        content : `Delete option "<span class='font-bold'>${active_option.value.name}</span>"`,
        ok : "Delete" , cancel : "Cancel"
    })
    if ( ret.action == 'ok') { 
        useRequest({url:'/api/site/options',method: 'delete', body: active_option.value }).then(async ()=>{
            await refresh_options()
            ref_obj_to_edit.value = null;  
        })
    }
}
let hnd_add_option = ()=>{
    let new_opt = {
        name : "new_option",
        value : ""
    }
    store.options.splice(0, 0, new_opt);
    hnd_edit( new_opt );
}

let hnd_advanced_edit = (opt)=>{
    var value = JSON.parse(JSON.stringify(opt))
    advance_edit_version.value = value;

    
    util.open_modal({id : advanced_modal.value }).then ( res =>{
        if (  res.action != 'ok') {
            advance_edit_version.value = null 
            return
        } 
        active_option.value.name = advance_edit_version.value.name
        var val = advance_edit_version.value.value 
        if ( Array.isArray(val) || typeof val == 'object') val = JSON.stringify(val)
        active_option.value.value = val 
        hnd_save_option()
    })
}


let filtered_options = computed(()=>{
    var out = the_options.value || [] 
    if ( search_option_name.value.length <= 1) return out
    return out.filter ((opt)=>{
        return opt.name && opt.name.includes(search_option_name.value )
    })
})
let hnd_option_changed = async ()=>{
    console.log ("Option changed")
}

 
</script>
<style scoped>
.row-item .hidden {
  display: block;
  opacity: 0;
  visibility: hidden;
}
.row-item:hover .hidden {
  opacity: 1;
  visibility: visible;
} 
</style>