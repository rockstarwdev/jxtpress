<template>
  <div class="page">
     

      <div class="row mt-3" v-if="!post.error">  
       
           <s-blocks v-model="post_value"  v-if="ready"
            :options="{ fonts: store.custom_font_names }"
            @settings="hnd_open_settings" 
            @change="hnd_change_notification"
            @update:modelValue="hnd_update_notification"></s-blocks>  

      </div>
      <template v-else>
          <h1 class="mb-3 color-red-500">{{ post.title }}</h1>
        <div class="card">
          <p v-html="post.description"> </p>
        </div>
      </template>
 
      
      <div class="inspector document" ref="inspector" v-show="is_setting_visible" style="z-index: 420;">

              <div class="flex justify-between">
                  <h3>Document</h3> <span class="tag border solid border-gray-400 bg-indigo-500 color-white">{{ post.type || 'unknown'}}</span>
              </div>
               
              <div class="wrapper">

                   
                <div class="row">
                  <div class="label" >Title</div>
                  <s-input v-model="post.title"> </s-input>
                </div>


                <div class="row">
                  <div class="label" >Description</div>
                  <s-textarea class="w-full" v-model="post.description"> </s-textarea>
                </div>
                <div class="row" v-if="post.type !='layout'">
                  <div class="label" >URL  </div>
                    <div class="inline-flex gap-1 items-center">
                      <span class="opacity-40 disabled user-select-none ">{{ url_prefix }}</span>
                      <s-input @typing-complete="hnd_url_typing_completed"
                      v-model="post.url" @change="post_process_url"> </s-input>

                    </div>
                </div>

                <div class="row">
                  <div class="label" >Status</div>
                  <s-select v-model="post.status" :values="status_types" 
                    :class="[post.source_id ? 'highlight' :'']" :data-title="post.source_id ? 'Draft of ' + post.source_id : '' ">
                  
                  </s-select>
                </div>

                <div class="row">
                  <div class="label" >Groups</div>
                  <s-select v-model="post.group_id" :values="groups"></s-select>
                  
                </div>

                <div class="row">
                  <div class="label" >Tags  </div>
                  <s-input v-model="post.tags" placeholder="Type [enter]"   @change="force_arr_tag"> </s-input>
                </div>

                <div class="row">
                  <div class="label" >Category</div>
                  <s-select v-model="post.category_id" :values="store.categories"> </s-select>
                </div>


                <div class="row" v-if="can_have_layout">
                  <div>Layout</div>
                  <s-select v-model="post.layout" :values="store.layouts"></s-select>
                  
                </div>
                <div class="row">
                  <div class="feature-image-preview" @click="hnd_click_on_feature_image" 
                    :style="{ backgroundImage:     `url('${feature_image}')`   }">

                  </div>
                  <div class="flex justify-between my-2">
                    <span>Feature Image</span> 
                    <button type="button" class="button primary flat" @click="post.image=null">remove</button>
                  </div>
                </div>
                <div class="row">
                  <div class="flex justify-between">
                     
                  <s-button  data-title="Postion permission settings" v-if="post.id && ! post.source_id" class="permission" @click="hnd_open_permission_manager">
                    
                    <span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    </span> 
                    Permissions</s-button>

                    <button data-title="Meta properties" class="button inline-flex items-center" @click="hnd_open_meta_manager">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 opacity-70">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                      </svg>
                      <span class="ml-2">Properties</span>
                    </button>
                  </div>
                </div>
                
                <div class="row" v-if="post.id && post.type != 'layout'" >
   
                </div>
                <div class="row">
                    

                </div>
              </div>
                <div class="row px-6 flex gap-4">
                  <s-button class="save solid primary" @click="hnd_save_post">
                     
                    Save</s-button>

                    <button v-if="!post.source_id" data-title="View existing drafts" 
                      @click="hnd_fetch_existing_drafts">
                      Drafts
                    </button> 
                     
                    <a v-if="post.id && post.type != 'layout'" 
                    :href="`/preview/${post.id}?full`" class="button" target="_blank">Preview</a>

                </div>
            </div>




        <div class="modal" ref="modal_drafts">
          <div class="wrapper md:w-350 lg:w-350"   >
              <div class="title flex gap-2 items-center">
                <h4>Drafts of Post {{ post.id }}</h4>
              </div>
              <div class="content">
                <ul class="list bordered border overflow-y-auto" style="max-height:340px">
                  <li v-for="(draft,i) in list_drafts" :key="draft+i">
                    <div>
                      <nuxt-link :to="`/user/posts/edit?id=${draft.id}`" class="modal-ok">
                        <span class="tag">{{  draft.id }}</span>
                        <span class="ml-2"> {{  draft.title }}</span>
                        <span class="ml-2"><span class="tag"
                          :data-title="'Status'"
                          :class="[draft.status]"> {{  draft.status || "None" }}</span></span>
                    </nuxt-link>
                    </div>
                    <div class="text-sm mt-3 pl-9 color-gray-500">Created by {{ draft.created_by_name}} last modified {{ draft.modified }}</div>
                    

                  </li>
                  <li v-if="list_drafts == null || ( list_drafts && list_drafts.length ==0)">
                    <div class="color-gray-400">No drafts found</div>
                  </li>
                </ul> 
              </div>
          </div>
        </div>



        <section class="meta-proerties-manager">
          <div class="modal" ref="meta_element">
            <div class="wrapper md:w-550 lg:w-650"   >
              <div class="title flex gap-2 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg> 
                <h3>Property Settings</h3>
              </div><!-- end title-->
              <div class="content" v-if="meta_state.is_open">
 
                  <s-button class="flat green" @click="hnd_add_meta" >
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
                      stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>

                    </span> Property </s-button>
                  <div v-if="meta_state.is_loading" class="loader loading primary"></div>
                  <ul class="mt-4" :style="{overflow:'auto', maxHeight: '280px'}">
                    <li v-for="(meta,index) in meta_state.data" :key="compute_key(meta,index)" class="post-meta-data">
                      <div class="flex gap-2" :class="[meta.delete ? 'opacity-40' : '']">
                        <button type="button" class="button danger color-red-500 align-self-start" @click="hnd_remove_meta(meta,index)">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                           stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>

                        </button>
                        <s-meta v-model="meta_state.data[index]" class="flex-1"></s-meta>
                      </div>
                      
                    </li>
                  </ul>

              </div><!-- end of content --> 
              <div class="footer flex justify-end gap-2">
                   <s-button class="modal-cancel">Cancel</s-button>
                   <s-button class="modal-ok primary flat">Save</s-button>
                </div>
            </div>
          </div>
        </section>














      <section class="Permission-Manager">
          <div class="modal" ref="pm_element">
              <div class="wrapper md:w-550 lg:w-650"   >
                <div class="title flex gap-2 items-center">
                  <span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    </span> 
                  <h3>Permissions</h3>
                </div>
                <div class="content" v-if="pm_state.is_open">
                  <s-button class="flat green" @click="hnd_add_permission" >
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
                      stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>

                    </span> Permission</s-button>
                  <div v-if="pm_state.is_loading" class="loader loading primary"></div>
                  <ul>
                    <li v-for="(perm,index) in pm_state.permissions" :key="perm.id+index+(perm.temp_key||'')">

                      <div class="flex gap-2">
                          <div>
                            <div>&nbsp;</div>
                            <s-button class="flat red" :class="[perm.delete ? 'solid':'']" @click="hnd_remove_permission(perm,index)">x</s-button>
                          </div>
                          <div class="flex gap-2 flex-row flex-1" :class="[perm.delete ? 'delete-permission' :'']">
                            <div class="w-1/3 flex flex-col">
                                <div class="label w-full  ">Read</div> 
                                <s-select v-model="perm.read_group" :values="all_groups"></s-select> 
                            </div>
  
                            <div class="w-1/3 flex flex-col">
                                <div class="label w-full  ">Update</div> 
                                <s-select v-model="perm.update_group" :values="all_groups"></s-select> 
                            </div>
  
                            <div class="w-1/3 flex flex-col">
                                <div class="label w-full  ">Delete</div> 
                                <s-select v-model="perm.delete_group" :values="all_groups"></s-select> 
                            </div>
                          </div> 
                      </div>

                    </li>
                  </ul>
                

                </div>
                <div class="footer flex justify-end gap-2">
                   <s-button class="modal-cancel">Cancel</s-button>
                   <s-button class="modal-ok primary flat">Save</s-button>
                </div>
              </div>
          </div>
    </section>
  </div>    
</template>

<script setup>
import { useMainStore } from "~/store";
import util from "~/assets/js/util"
/**
 * HTML reference to the Document Level Inspector
 */
const inspector = ref(null) 
const store = useMainStore()
 

const route = useRoute(); 

definePageMeta({
  title : "Page Post Type",
 layout: "user", //override page layout or use  setPageLayout('custom')
 middleware : [
  "auth",
    async (to,from)=>{
      var query = to.query;
      const store = useMainStore() 

      
      await   store.load_post( query  ); //load the page that is to be rendered 
      store.load_layouts(); 
    
    }
  ]
});
await store.process_post(route  )
await store.load_categories()

useHead({
  title:  "Edit - " + route.query.id  ,
  meta: [
    ... store.rendered_post.meta_seo
  ],
  bodyAttrs: {   },
  script: [  
    ... store.rendered_post.head_scripts
  ],
  link : [
    { rel:"preconnect", href:"https://fonts.googleapis.com" },
    { rel:"preconnect", href:"https://fonts.gstatic.com" },
    ... store.rendered_post.links 
  ],
  style : [
    ... store.rendered_post.head_style 
  ]
}) 



/**
 * Will be initialized to store.post where store.post will be a object like
 * { id :Null/Undefined/int, account_id, group_id, ... value : Array of Block Instaces }.
 * 
 * post.value.value will point to block instances (Array)
 */
const post = ref(store.post)  

var post_initial_value = post.value.value ;
console.log ("Edit Post value", post_initial_value, "<------")

const post_value = ref( JSON.parse(JSON.stringify(post_initial_value) ));

 

let compute_key = computed(()=>{
  return (o, index =-1)=>{
      return o.id+index+(o.temp_key||'')
  }
})

let url_prefix = computed(()=>{
  var type = post.value.type
  
  if ( type  =='admin-page') type = 'user'

  var prefix = "/" + type
  return prefix
})

let hnd_change_notification =(data)=>{
  post.value.value = null; 
  
  post.value.value = data  ;
  
  console.log ("modal.changed")
}
let hnd_update_notification =(data)=>{

}
let event_meta_change =(e)=>{
  console.log("Event-component change", e)
}

 

let show_inspector = ref(false)
const groups = ref(null )
const status_types = ref([
{ title : "Select one", value : ""},
{ title : "Draft", value : "draft"},
{ title : "Published", value : "published"},
{ title : "Pending", value : "pending"}, 
{ title : "Deleted", value : "delete"}, 
])

let load_groups = async ()=> {  
    groups.value =  await store.load_groups() ;    
}
load_groups();


let can_have_layout = computed(()=>{
  var type = post.value.type;
  var excluded = ['layout','form','template_part'];
  return ! excluded.includes( type )
})


let ready = ref(false)
onMounted(()=>{
  ready.value = true 
})






 
let hnd_open_settings = (e)=>{ 
  if ( e.action == 'toggle'){ 
    show_inspector.value = !show_inspector.value  
  }else  
    show_inspector.value = e.value 
  
  //post.value.value = e.data 
} 
let is_setting_visible = computed(()=>{
  return show_inspector.value 
})
onMounted(()=>{
  //On Mount, create automatic resize listener
  let update_size = (e)=>{
  var wrap = inspector.value.querySelector(".wrapper");
    var css_height = (window.innerHeight*0.88 ) + 'px'
    wrap.style.maxHeight = wrap.style.height = css_height;
  }
  window.addEventListener('resize', update_size);
  update_size()
})

/**
 * When Feature Image area is clicked, create a selector to pick from various images
 * @param {Event} e 
 */
let hnd_click_on_feature_image = (e)=>{
  var url = [ post.value.image ];
  util.open_media({ files : url}).then(ret=>{ 
    if ( ret.action == 'ok' && ret.d.length > 0){
      var url = ret.d[0].url;  
      post.value.image = url ; 
    }
  })
}
/** Used to create default image holder */
let feature_image = computed(()=>{
  var def = "https://placehold.co/600x400"
  if ( ! post.value ) return def 
  return post.value.image || def 
})

 
let post_process_url = ()=>{
  post.value.url  = post.value.url.replace(/\s/gm, '-').toLowerCase();
}
let force_arr_tag =()=>{
  var tags = post.value.tags
  if ( !Array.isArray(tags)){ 
    post.value.tags = tags != null ? [tags] : []
  }
}

let hnd_save_post = async ()=>{
  var is_new = post.value.id == undefined || post.value.id == null || post.value.id == -1
  var current_id = post.value.id || -1;
  var ret = await useRequest( {
    url: '/api/posts', 
    method : 'post' , 
    body : { ... post.value, value :post_value.value  } 
  })
  if ( ret.d )   post.value = ret.d 

  
  if (is_new || current_id != post.value.id ) {
    navigateTo(`/user/posts/edit?id=${post.value.id}`)
  }
 
}
let hnd_url_typing_completed = (e)=>{
  var payload = { id : post.value.id, url : post.value.url, type : post.value.type}
  useRequest({url: '/api/posts/check-url',method:'post', body: payload }).then(ret=>{
   

  })
}



var meta_element = ref(null)
let meta_state = ref({
    is_open : false, 
    is_loading : false, 
    data : [] 
})
let hnd_open_meta_manager = async ()=>{
  meta_state.value.data  = []
  if ( !post.value.id ) return; 
  
    meta_state.value.is_open = true; 
    meta_state.value.is_loading = true; 

    util.open_modal({
      id : meta_element.value
    }).then ( (ret)=>{
      meta_state.value.is_open = false; 
      if ( ret.action == 'ok') hnd_save_meta_properties()
    })


    let res = await useRequest({ url:  `/api/posts/meta?post_id=${post.value.id}` })
    meta_state.value.is_loading = false; 
    meta_state.value.data = res.d; 

}


let hnd_remove_meta = (meta, index)=>{
  if (!meta.id){
    meta_state.value.data.splice(index,1);
    return; 
  }
  if ( meta.delete == undefined){
    meta.delete = true; 
    return; 
  }
  meta.delete = !meta.delete
}
let hnd_add_meta = (meta)=>{
  if ( ! meta_state.value.data || !(Array.isArray(meta_state.value.data ))){
    meta_state.value.data = [];
    console.log ("Returning ")
  }
  var post_id = post.value.id ; 
  if ( ! post_id ) return 

  meta_state.value.data.push({
    post_id,  name : "" , value : "",
    temp_key : Date.now() + 'Key'
  }) 
}

let hnd_save_meta_properties = ()=>{

  var val = meta_state.value.data; 
  useRequest({url: "/api/posts/meta", method:'post', body : val })

}
/**
 * Permission manager state control.  When 
 */
let pm_state = ref({
  is_open : false ,
  is_loading : false, 
  permissions : null //Will point to an array of permission lists
})
let pm_element = ref(null)
let all_groups = ref(null)
let hnd_open_permission_manager = async ()=>{
  pm_state.value.permissions = []
  if (!post.value) return ;
  if ( ! post.value.id) return ;

  //Fire up the loading animation and open the window
  pm_state.value.is_open = true;

  pm_state.value.is_loading = true; 
  // call the modal function asynchronously 
  util.open_modal({
    id : pm_element.value
  }).then ( (ret)=>{
    if ( ret.action == 'ok') hnd_save_permissions()
  })
  var res = null; 
  res = await useRequest ({ url: `/api/groups/all` } );
  
  all_groups.value = res.d 
  if ( Array.isArray(all_groups.value) ){
    all_groups.value.splice(0,0,{
      id : null, title : "Public"
    })
  }
  if ( all_groups.value  ) {
    all_groups.value.forEach( g =>{

      for(var i=0; i < groups.value.length; i++){
        if ( g.id == groups.value[i].id ) {
          g.enabled = true; 
        }else{
          g.enabled = false 
        }
      }
    })
  }
  res = await useRequest( { url: `/api/posts/access/${post.value.id}` })
  pm_state.value.is_loading = false; //clear plage

  pm_state.value.permissions = res.d; 
}

 
let hnd_remove_permission = (perm, index)=>{
  if (!perm.id){
    pm_state.value.permissions.splice(index,1);
    return; 
  }
  if ( perm.delete == undefined){
    perm.delete = true; 
    return; 
  }
  perm.delete = !perm.delete
}
let hnd_add_permission = (perm)=>{
  if ( ! pm_state.value.permissions || !(Array.isArray(pm_state.value.permissions ))){
    pm_state.value.permissions = [];
    console.log ("Returning ")
  }
  var post_id = post.value.id ; 
  if ( ! post_id ) return 

  pm_state.value.permissions.push({
    post_id, 
    read_group : null, 
    update_group : null, 
    delete_group : null ,
    temp_key : Date.now() + 'Key'
  }) 
}
/**
 * The user clicked "save" from within the Permissions manager
 */
let hnd_save_permissions = async ()=>{
  var val = pm_state.value.permissions; 
  const res = await useRequest({url: "/api/posts/access/modify",method:'post', body : val })
}

let modal_drafts = ref(null);
let list_drafts = ref(null);
let hnd_fetch_existing_drafts = async ()=>{
  if ( ! post.value.id ) return;

  
  list_drafts.value = await store.load_posts({ 
    source_id : post.value.id , columns : ['id','title','description','created_by', 'modified', 'status'] 
  
  })
  var ret = await util.open_modal({
    id : modal_drafts.value ,
  })
  
}



</script>
<style scoped>
.inspector > .wrapper {
  height: 90vh;
  max-height: 90vh;
  overflow: auto;
  padding: 0.25em;
}
.delete-permission {
  opacity: 0.45;
}
.feature-image-preview {
    cursor: pointer;
    max-height: 80px;
    min-height: 120px;
    background-size: contain;
    background-repeat: no-repeat;
    width: 100%;
    background-position: center;
    border-radius: 4px;
    padding: 3px;
    background-color: var(--gray-100);
    border: 1px solid var(--ui-border-color);
}

</style>