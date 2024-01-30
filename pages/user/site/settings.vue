<template>
 
    <div class="page">
        
 
        <h1  class="md:flex flex mb-4">General Settings</h1>  
        
        <div class="layouts-setting"> 
            <div class="card my-3">
                <h2 class="mb-4">Site</h2>
 

                <div class="flex row gap-2" v-for="opt in site_options">
                    <div class="w-1/3"> {{  capital(  opt.name )   }}</div>
                    <div class="w-2/3">
                        <s-input v-model="opt.value" placeholder="http://www.localhost.com"></s-input>
                    </div>
                </div>
                <div class="flex justify-center">
                    <button class="success"  @click="hnd_save_site_settings" >Update </button>
                </div>

            </div>

            <div class="card my-3">
                <div class="mb-4 flex w-full">
                    <h3>Custom Post Types</h3>
                    <button class="button ml-6" @click="hnd_new_cpt">New Post Type</button>
                </div>

                <ul>
                    
                    <li v-for="(pt,index) in cpts"
                        class="media" style="margin-bottom: 0.25em"
                        :key="pt.name+index">
                        <div class="image flex justify-center items-center" style="max-width: 100px; min-width: 100px; min-height: 80px;">
                            <template v-if="pt.icon">
                                <span v-if="pt.icon.startsWith('<svg')" v-html="pt.icon"></span>
                                <img v-else :src="pt.icon">
                            </template>
                            
                        </div>
                        <div class="content   ">
                            <h3 class="row-item">
                                <span>  {{  pt.title  || "Untitled"}} ({{ pt.name  }})</span>
                                <button class="button sm ml-5 hidden" @click="hnd_edit_cpt(pt)">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                    </svg>
                                </button>
                                <button class="button sm ml-5 hidden" @click="hnd_delete_cpt(pt)">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                     stroke="currentColor" class="w-5 h-5 color-red-500">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>

                                </button>
                            </h3>
                            <div>{{ pt.description || "No description." }}</div>
                        </div> 
                    </li>
                </ul>
            </div>
            <div class="card my-3">
                <h3 class="mb-4">Layouts</h3> 
                <ul>
                <li v-for="(opt, index) in layout_options" :key="opt.name">
                    <div class="flex row">
                        <div class="w-1/3 flex items-center">
                            {{  capital(opt.name) }}
                        </div>
                        <div class="w-2/3"> 
                            <s-select v-model="opt.value" :values="postlayouts_list"></s-select>
                        </div>
                    </div>  
                </li> 
                </ul>
                <div class="flex justify-center"> 
                    <p class="color-gray-400">Save changes </p>
                </div> 
                <div class="flex justify-center"> 
                    <button class="button success" @click="hnd_save_post_layouts">Update</button>
                </div> 
            </div>     
            
            <div class="card my-4">
                <div class="flex items-center gap-2 mb-3"> 
                    <h2>Site Fonts</h2>  
                    <button class="button ml-3 px-2" @click="hnd_insert_new_font">Add</button>
                    <button class="button ml-3 px-2" @click="init_site_fonts">Refresh</button>
                </div>
                <div class="mt-1 mb-3 color-gray-600">Site Wide Google fonts</div>
                <div class="flex gap-2 mb-2 items-start" v-for="(font,fi) in site_fonts.value " :key="'font'+fi">
                    <button class="button sm danger px-3" @click="hnd_remove_font(fi)">x</button>
                    <s-input  type="text" v-model="site_fonts.value[fi]" placeholder="Roboto:wght@100;300;500" />
                </div>
                <div v-if="!site_fonts.value || (site_fonts.value && site_fonts.value.length==0)">
                    No Google fonts specified
                </div>
                
                <div class="flex justify-center p-2">
                    <button class="button success" @click="hnd_save_font_script_links">Update</button>
                </div>
            </div>

            <div class="card my-4">
                <h2 class="mb-3">Stripe Account</h2>
                <div class="row flex gap-2">
                    <div class="  w-1/3">Publishable Key</div>
                    <div class="w-2/3"><s-input v-model="stripe_data.stripe_publishable_key"></s-input></div>
                </div>
                <div class="row flex gap-2">
                    <div class="  w-1/3">Secret Key</div>
                    <div class="w-2/3"><s-input v-model="stripe_data.stripe_secret_key_secret" type="password"></s-input></div>
                </div>
                

                <div class="row flex gap-2">
                    <div class="w-1/3">Auto Import Products</div>
                    <div class="w-2/3">
                        <s-switch v-model="stripe_data.stripe_auto_import_products"  ></s-switch>
                    </div>
                    
                </div>

                <div class="row flex gap-2">
                    <div class="w-1/3">Auto Sync</div>
                    <div class="w-2/3">
                        <s-switch v-model="stripe_data.stripe_auto_sync"  ></s-switch>
                    </div>
                    
                </div>

                <div class="row flex gap-2">
                    <div class="w-1/3">Currency Type</div>
                    <div class="w-2/3">
                        <s-select v-model="stripe_data.stripe_currency"  :values="currency_choices" ></s-select>
                    </div>
                    
                </div>

                <div class="row flex gap-2">
                    <div class="w-1/3"></div>
                    <div class="w-2/3">
                        <button type="button" class="success button" @click="hnd_update_stripe">Update</button>
                    </div>
                </div>
            </div>
        </div>


        <div class="modal" ref="modal_cpt">
            <div class="wrapper">
                <div class="title"><h3>Edit Custom Post Type</h3></div>
                <div class="content" v-if="active_cpt" style="min-width: 420px">
                    <div class="row flex gap-2">
                        <div class="w-1/3">Name</div>
                        <div class="w-2/3">
                            <s-input class="simple w-full" type="type" v-model="active_cpt.name" placeholder="Post type name" />
                        </div>
                    </div>


                    <div class="row flex gap-2">
                        <div class="w-1/3">Singular Title</div>
                        <div class="w-2/3">
                            <s-input class="simple w-full" type="type" v-model="active_cpt.title" placeholder="Signular Title"/>
                        </div>
                    </div>
                    <div class="row flex gap-2">
                        <div class="w-1/3">Plural Title</div>
                        <div class="w-2/3">
                            <s-input class="simple w-full" type="type" v-model="active_cpt.title_plural" placeholder="Plural Title"/>
                        </div>
                    </div>
                    <div class="row flex gap-2">
                        <div class="w-1/3">Description</div>
                        <div class="w-2/3">
                            <s-textarea class="simple w-full" type="type" v-model="active_cpt.description" 
                            placeholder="Custom post type description" /> 
                        </div>
                    </div>
                    <div class="row flex gap-2">
                        <div class="w-1/3">

                        </div>
                        <div class="w-2/3"> 
                            <div class="row" >
                                <s-checkbox v-model="active_cpt.show_admin">Show in Admin</s-checkbox>
                            </div> 
                        </div>  
                    </div>
                    <div class="row flex gap-2">
                        <div class="w-1/3">Capability</div>
                        <div class="w-2/3">
                            <s-select v-model="active_cpt.capability" :values="capabilities"></s-select>
                        </div>
                    </div>

                    <div class="row flex gap-2">
                        <div class="w-1/3">Icon</div>
                        <div class="w-2/3">
                            
                            <s-input v-model="active_cpt.icon"  ></s-input>
                        </div>
                    </div>

                    <div class="row flex gap-2">
                        <div class="w-1/3">Status</div>
                        <div class="w-2/3">
                            
                            <s-select v-model="active_cpt.status" :values="status_choices"></s-select>
                        </div>
                    </div>

                </div>
                <div class="footer flex justify-end gap-2">
                    <button class="modal-cancel">Cancel</button>
                    <button class="modal-ok success">Ok</button>
                </div>
            </div>
        </div>
    </div>    
</template>

<script setup>
import util from "~/assets/js/util";
import { useMainStore } from "~/store";
  
let capital             = useCapital()



useOnPageReady();


 
let store   = useMainStore() 
const route = useRoute(); //route.params.<NAME>, route.title.<NAME>
definePageMeta({
   layout: "user", //override page layout or use  setPageLayout('custom')
   middleware : [
    "auth",
    
    async (to, from)=>{
      var store = useMainStore()
        await store.process_post(to, { native: true} )
    
    }
  ]
});


useHead({
  title: store.rendered_post.title ||"Settings" ,
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




/**
 * Site options that appear at the every top and are site and navigation specific
 */
let site_options = ref([])
let init_site_options = async ()=>{
    var field_names = ['site_title', 'site_base_url', 'pagination_limit']
    site_options.value = []
    let temp_arr  = (await useRequest({ url: "/api/site/options",
        method: 'get',
        query : {
            name : field_names
        }
    })).d || []
    if ( !Array.isArray(site_options.value))site_options.value = []

    var field = null; 
    for ( var i=0; i < field_names.length; i++){
        field = temp_arr.find ( it => it.name == field_names[i]) 
     
        if ( ! field ) {
            site_options.value.push({ name : field_names[i] , value : ""})
        }else {
            site_options.value.push( field )
        }
    }
 
}
let hnd_save_site_settings = ()=>{

    useRequest({ url: "/api/site/options",method: "post", body : site_options.value  })
}
await init_site_options()




var site_fonts = ref({
    name : "site_fonts_arritem",
    value : []
})
let init_site_fonts = async ()=>{
    site_fonts.value.value = []
    var existing_fonts  = (await useRequest({ url: "/api/site/options?like=site_fonts_arritem" })).d || []
    if ( existing_fonts.length != 0 ) {
        site_fonts.value.id = existing_fonts[0].id 
        site_fonts.value.value = existing_fonts[0].value 
    }
}
init_site_fonts ();
let hnd_insert_new_font = ()=>{
    site_fonts.value.value.push("");
}
let hnd_remove_font = (index)=>{
    site_fonts.value.value.splice(index,1)
}
let hnd_save_font_script_links = async ()=>{

    var payload = [
        site_fonts.value 
    ]
    var ret  = await useRequest({url: "/api/site/options", method: "post", body : payload })

}


// ----------------------------------------------------------------------------------
// Layout Logic
// ----------------------------------------------------------------------------------
/** Holds all layouts available on the site */
var postlayouts_list    = ref( (await useRequest({ url: "/api/posts/layouts?short"})).d || [] )
let layout_options      = ref( null )

 /** Get site post types  */
let post_types          = ref( [] )

let load_post_types = async ()=>{
    post_types.value =  (await useRequest({ url :"/api/posts/types" })).d
}
await load_post_types()

let cpts = computed(()=>{
    if (! post_types.value ) return [];
    return post_types.value.filter( pt => !pt.native )
})

let init_layout_options = async ()=>{
    // grab array of { name, value , id }
    var existing_options  = (await useRequest({url: "/api/site/options?like=layout_for" })).d || []
    
    var def_in_options = existing_options.find(it => it.name.toLowerCase() == 'layout_for_default' );
    var def = null; 
    if (   !def_in_options){  
        var existing_def = (await useRequest({ url: "/api/site/options?like=layout_for_default"})).d || []
        if ( existing_def.length == 0 ) {
            def = { name : 'layout_for_default', value: null } 
        }else {
            def = existing_def[0] 
        }
        existing_options.splice(0,0, def)
    }else {
        var index=-1;
        for(var i=0; i < existing_options.length; i++){
            if ( existing_options[i].name.toLowerCase() == 'layout_for_default'){
                index = i;
                def = existing_options[i]
                break;
            }
        }
        if (def ) {
            existing_options.splice(index,1);
            existing_options.splice(0,0, def)
        }
    }
    //   existing_options[j].value = JSON.parse(existing_options[j].value)
    
    layout_options.value = [] 

    if ( postlayouts_list.value) { 
        if ( postlayouts_list.value[0].id != null){
            postlayouts_list.value.splice(0,0, { value : null, title : "None"})
        }
    }

    var pt, opt_name, opt_value, existing_opt;  
    let restricted_post_types = ['layout','media']
    //Splice in Types that must always exist
    var looped_posttypes_layout = [ 
                         { title : "Default Layout",name: "default" }, 
                         { title : "Default Admin Layout",name: "default_admin" }, 
                         { title : "Search Layout",name: "search" } , 
                         { title : "Tag Layout",name: "tag" } ,
                         { title : "Category Layout",name: "category" } ,
                         { title : "404 Layout",name: "404" } ,
                         { title : "Forbidden Request",name: "403" } ,
                        ... post_types.value,  ]
 
    for ( var i = 0;  i < looped_posttypes_layout.length; i++){
        pt = looped_posttypes_layout[i];
        if (restricted_post_types.includes( pt.name) ) continue;
        opt_name = `layout_for_${pt.name}`;
         
        existing_opt = existing_options.find(opt => opt.name == opt_name ) || null ;
        opt_value =  existing_opt ? existing_opt.value : '' 
         
        layout_options.value.push({
            id : existing_opt ? existing_opt.id : undefined,
            name : opt_name,
            value : opt_value, old_value : opt_value
        })
    }
}
init_layout_options();


let hnd_save_post_layouts = ()=> {
    let update_option = async (pto, index)=> {

        var ret  = await useRequest({ url: "/api/site/options",method: "post", body : pto })
        if ( ret.d  ){
            layout_options.value[index] = pto;//update the layout
        }
    }
    var pt ;
    for ( var i=0; i < layout_options.value.length; i++){
        pt = layout_options.value[i];
        if ( pt.value !== pt.old_value){
            update_option ( pt , i);
        }
    }
}







// ----------------------------------------------------------------------------------
// CPT Logic
// ----------------------------------------------------------------------------------
let modal_cpt = ref(null)
let active_cpt = ref (null)
let status_choices = ref([
    { title : "Active", value : "active" },
    { title : "Inactive", value : "inactive" },
])
let hnd_new_cpt = ( ) => {
    hnd_edit_cpt( {
        name : "",
        title : "",
        description : "",
        priority : "", 
        capability : "",
        show_admin : true , 
        status : ""
    })
}
let capabilities = ref(null);
let load_capabilities = async ()=> { 
    var res = await useRequest({url: "/api/site/capabilities" })
    if ( res.d ) {
        capabilities.value = res.d.map (it => {  
           return  { title : it.name, value : it.name   }
            
        }) 
    }
}
let hnd_edit_cpt = async  (post_type)=>{
    active_cpt.value = post_type;
    console.log (JSON.parse(JSON.stringify(post_type)))

   await load_capabilities()

    var ret = await util.open_modal({
        id : modal_cpt.value 
    })
    if ( ret.action != 'ok') return ;

    var keys = Object.keys( active_cpt.value );
    var value = [];
    for ( var k of keys ) {
        if ( k == 'native' || k == 'is_custom') continue; 
        value.push({ name : k, value : active_cpt.value[k] })
    }
    var name = active_cpt.value.name 
    var out = { name : `posttype_${name}_arrobj` , value }
    
    var res = await useRequest( {url: "/api/site/options", method: 'post', body : out })
    load_post_types()
}
let hnd_delete_cpt = async (post_type)=>{
    console.log("Delete ", post_type, post_type.id )
    await util.open_modal({
        title : `<div class="title color-red-500 font-extrabold">Delete Post Type</div>`,
        content : ` 
            <div class="content">
                <p>Are you sure you want to delete<br> custom post-type <b>${post_type.title}</b>?</p>
            </div>
        `,
        cancel: "Cancel", ok : "Confirm" 
    })
}

let stripe_data = ref({})
let currency_choices = ref([])
    currency_choices.value = (await useRequest({ url: "/api/site/currencies" })).d || []
let load_stripe_data = async ()=>{
    

    var field_names = ['stripe_publishable_key', 'stripe_secret_key_secret',
     'stripe_auto_import_products', 'stripe_auto_sync', 'stripe_currency']
    stripe_data.value = {}
    let temp_arr  = (await useRequest({url:"/api/site/options",
        method: 'get',
        query : {
            name : field_names
        }
    })).d || []

    //create fields
    var field = null, initial_value 
    for ( var i=0; i < field_names.length; i++){
        field = temp_arr.find ( it => it.name == field_names[i]) 
        if ( ! field ) {
            initial_value = ""
            if ( field_names[i] == 'stripe_currency') initial_value = 'USD'
            stripe_data.value[ field_names[i] ] = initial_value
        }else {
            stripe_data.value[ field.name ] = field.value 
        }
    }
}
await load_stripe_data ()
let hnd_update_stripe = ()=>{ 
    var body =  [];
    for(var key in  (stripe_data.value)) {
        body.push ( { name : key, value : stripe_data.value[key] })
    }
    console.log (body)
    useRequest({url: "/api/site/options", method: "post", body   })
}

 
 
</script>
<style scoped>


</style>