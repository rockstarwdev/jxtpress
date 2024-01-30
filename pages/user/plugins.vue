<template>
    <div class="page">
        <h1  class="md:flex flex">Plugins </h1>
  
        
        <div class="card">
            <div class="row mt-3">  
                <div class="flex gap-3">
                    <button class="button green flat my-2 mb-4" 
                        type="button" @click="hnd_refresh_plugins"
                        data-title="Refresh list of plugins" 
                        data-placement="bottom" >
                        Refresh
                    </button>
                    <button class="button my-2 mb-4 flat" @click="hnd_create_new_plugin">
                        New Plugin
                    </button>
                </div>
                <s-table v-model="plugins" :options="table_options">
                    <template #title="{row}">
                      <div class="font-bold">{{ row.title  }}</div>
                      <div class="flex  p-2"> 
                            <span class="tag" :class="[row.status]">{{  row.status }}</span>
                        </div>
                    </template>
                    <template #status="{row}">
                      
                        <div class="button-group">
                            <button type="button" class="button ripple" v-if="show_button(row,'install')" @click="hnd_update_status(row,'install')">
                                Install
                            </button>
                            <button type="button" class="button ripple" v-if="show_button(row,'inactive')" @click="hnd_update_status(row,'inactive')">
                                Inactivate
                            </button>
                            <button type="button" class="button ripple" v-if="show_button(row,'active')" @click="hnd_update_status(row,'active')">
                                Activate
                            </button>
                            <button type="button" class="button ripple" v-if="show_button(row,'uninstall')" @click="hnd_update_status(row,'uninstall')">
                                Uninstall
                            </button>
                        </div>
                    </template>
                    <template #url="{row}">
                         <div>
                            <div>{{ row.description || "Silence" }}</div>
                            <div class="text-sm mt-2 color-gray-400">{{ row.url }}</div>
                         </div>
                    </template>
                    <template #action="{row}">
                        <div>
                            <button class="button" @click="hnd_edit_plugin (row)">edit</button>
                            <button class="button danger" @click="hnd_delete_plugin (row)">delete</button>
                        </div>
                    </template>
                </s-table>

                <div class="my-3">
                    <h3 class="mb-3">Registered Components</h3>
                    <ul class="list stripped border hover">
                        <li v-for="comp in reg_comps" :key="comp.name">
                            <h4>{{  comp.name  }}</h4>
                            <p class="mt-1 color-gray-500">{{ comp.description || "No description" }}</p>
                            <div class="ml-5 props color-gray-400">{{  comp.props || "no props listed" }}</div>
                        
                        </li>
                        <li v-if="!reg_comps || (reg_comps && reg_comps.length ==0)">
                            <p>There are no custom components registered</p>
                        </li>
                    </ul>
                </div>
            </div>

            
        </div>
    </div>    
</template>

<script setup>
import { useMainStore } from "~/store";
import util from "~/assets/js/util"
 
const store = useMainStore()

const page_data = store.page_data;
const plugins = ref(page_data ? (page_data.plugins || []) : [] );
 
let reg_comps = ref([]) 
useOnPageReady();
let show_button = computed (()=>{
    return (plugin, button_type)=>{
        let status = plugin.status;
        if ( status == 'active') {
            return ['inactive','uninstall'].includes(button_type)
        }else if (status == 'inactive'){
            return ['active','uninstall'].includes(button_type)
        }else if ( status =='uninstall'){
            return ['install'].includes(button_type)
        }else if ( status =='install'){
            return ['active', 'uninstall' ].includes(button_type)
        }
    }
})
let hnd_update_status = util.debounce( async (plugin, status)=>{
    plugin.status = status 
    try { 
        var ret = await useRequest({url: "/api/site/plugin", method:"post", body : {id : plugin.id , status : plugin.status }});
        plugin.status = ret.d;
    }catch(e){
        console.error(e);
    }
})
let hnd_refresh_plugins = ()=>{
    useRequest({url: "/api/site/plugin", method:"post", body : { id : "refresh" }}).then( ret =>{
        plugins.value = ret.d; 
        reg_comps.value = ret.components_list
    })
}
let hnd_create_new_plugin = async ()=>{
    var cls= "input text border border-gray-300 focus:border-primary-500"
    var plugin_filename = null; 
    var res = await util.open_modal({
        title : "<h4>New Plugin Name</h4>",
        content : `
            <div class="row">
                <div>Plugin File Name</div>
                <input id="plugin-file-name" type="text" class="${cls}">    
            </div>
        `,
        before_ok(am){
            var io = am.querySelector("#plugin-file-name");
            var io_value = io.value; 
            if ( !io_value ) return false; 
            
            io_value = io_value.trim().toLowerCase().replace(/[\s_]/gm,'-')
            if ( !io_value.endsWith(".js")) io_value += ".js"
            if ( !io_value.startsWith(`/site-plugins/`)) {
                io_value = '/site-plugins/'+io_value
            }
            plugin_filename = io_value
        },
        cancel : "Cancel",  ok : "Create", 
    })
    if ( res.action != 'ok') return ;
    //At this point we have a valid file name
    res = await util.code_editor({
        title : plugin_filename, 
        value : await store.get_new_plugin_template() 
    })
    if ( res.action == 'ok'){
        hnd_save_plugin_content( {
            src_path : plugin_filename,
            value : res.value 
        })
    }

}


let hnd_edit_plugin = async (row)=>{

    var plugin_content = await store.get_plugin_src({ src_path : row.url })
    var res = await util.code_editor({
        title : row.url, 
        value : plugin_content 
    })
    if ( res.action == 'ok'){ 
        hnd_save_plugin_content( {
            src_path : row.url,
            value : res.value 
        })
    }
}

let hnd_delete_plugin = async (row)=>{

    let res = await util.open_modal({
        content : `<div>
                <p>Are you sure you want to delete plugin<br> <em>${row.title}</em> at <span class="tag">${row.url}</span></p>
            </div>`,
        cancel : "Cancel",
        ok : "Delete"
    })
    if ( res.action != 'ok' ) return ; 

    await store.remove_plugin({ src_path : row.url });
}

let hnd_save_plugin_content = async (options)=>{
  await store.set_plugin_src (options) 
}

onMounted(()=>{
    hnd_refresh_plugins()
})

let table_options = ref({
    columns : [ "title", {name :  "url" , title : "Description", width: "auto"},"status"]
})

const route = useRoute(); //route.params.<NAME>, route.title.<NAME>
definePageMeta({
    title : "Plugins",
   layout: "user", //override page layout or use  setPageLayout('custom')
   middleware : [
        "auth",
        async function (to, from) {
        // Custom inline middleware
        let store =  useMainStore()
        await store.process_post(to,{ native:true})
        },
        
    ]
});
 


useHead({
  title:  store.rendered_post.alt_title || "Plugins" ,
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
</script>