<template>
 
    <div class="page">
        <h1  class="md:flex flex mb-4">Groups</h1>
        
        <s-button class="primary outline" @click="hnd_add_group">Add</s-button>
        <ul class="list border my-3 card ">
            <li v-for="(group,oi) in store.groups" :key="group.name + '_'+oi"  >
                <div v-if="ref_obj_to_edit != group" class="flex items-start">
                    <s-button class="pencil flat primary mr-2" @click="hnd_edit(group)">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg> 
                    </s-button>
                    <div class="w-full">
                        <div class="flex justify-between">
                            <h3>  {{  group.title  }} </h3>
                            <div> members <span class="badge bg-black color-white">{{ group.members  }}</span></div>
                        </div>
                        
                        <div>
                            {{ group.description }}
                        </div>
                        <div class="text-sm color-gray-400">Created <span class="date">{{ formater.utc_to_simple(group.created) }}</span></div>
                    </div>
                    
                </div>
                <div v-else>
                    <div class="flex">
                        <div class="flex flex-col mr-3">
                            <s-button class="flat green check mb-2" @click="hnd_save_group">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </s-button>
                            <s-button class="flat red remove" @click="hnd_remove_group">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>

                            </s-button>
                        </div>
                        <div class="flex-1">
                            <div class="mb-2">
                                <s-input v-model="active_group.title" class="w-full"></s-input>
                            </div>
                            <div class="mb-2">
                                <s-textarea v-model="active_group.description" class="w-full"></s-textarea>
                            </div>
                        </div>
                    </div>
                </div>
                
            </li>
        </ul> 
    </div>    
</template>

<script setup>
import { useMainStore } from "~/store";
 

let formater = useTimeFormat()
 

useOnPageReady();



let store = useMainStore() 
const route = useRoute(); //route.params.<NAME>, route.title.<NAME>
definePageMeta({
   layout: "user", //override page layout or use  setPageLayout('custom')
   middleware : [
    "auth",
    async (to, from)=>{
      var store = useMainStore()
      await store.process_post(to, { native:true})
        store.load_groups()
    }
  ]
});


useHead({
  title: store.rendered_post.title ||"Site Groups" ,
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



let ref_obj_to_edit = ref(null)
let active_group = ref(null)
let hnd_edit = (group)=>{
    ref_obj_to_edit.value = group;
    active_group.value = JSON.parse(JSON.stringify(group))
}
let hnd_save_group = ()=>{
    if ( ! active_group.value) return false; 
    
   store.modify_groups(active_group.value ).then(async ()=>{
      await store.load_groups({  })
        ref_obj_to_edit.value = null; 
        store.load_groups()
    })
}
let hnd_remove_group = ()=>{
    useRequest({ url: '/api/groups', 
        method: 'delete', body: { id : active_group.value.id } }).then(async ()=>{
        await store.load_groups({  })
        ref_obj_to_edit.value = null;  
    })
}
let hnd_add_group = ()=>{
    let new_group = {
        title : "New Group",
        description : ""
    }
    store.groups.push(new_group);
    hnd_edit( new_group );
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