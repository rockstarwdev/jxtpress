<template>
    <div class="page">
        <h1  class="md:flex flex row-item">{{ form_descriptor.title  }} 
            <nuxt-link :to="'/user/posts/edit?id='+form_descriptor.post_id" class="hidden ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
                    class="w-4 h-4">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>

            </nuxt-link>
        </h1>
 

        <div class="card my-4"> 
          <nuxt-link class="button primary flat rounded p-2 mb-2" :to="'/user/form/edit?id=new&form_id=' +form_descriptor.post_id">New</nuxt-link>

            <div class="accordion-item">
                <h2 class="title">Fields</h2>
                <ul class="field-list list border round content">
                    <li v-for="field in fields_types" :key="field.id" class="item list-item"> 
                        <div class="font-bold">{{  field.field_name  }}</div>
                        <div> <span class="tag indigo">{{  field.type }}</span>  <span class="is-required" v-if="field.is_required">required</span></div>
                        <div class="mt-2 text-xs">{{  field.label }}</div>
                    </li>
                </ul>
            </div>
        </div>

        <div class="card my-4">
            <h2>Submissions {{ form.child_count }}</h2> 

            <div class="my-4 py-1 flex gap-2">
              
                <div>
                    <div class="label text-sm">Status</div>
                    <s-select v-model="bulk_action" :values="bulk_action_types" @select="hnd_bulk_status">
                        
                    </s-select>
                </div>

                <div>
                    <div>&nbsp;</div>
                    <button @click="load_form_entries" class="mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
    
                        <span>Refresh</span>
                    </button>
                </div>
                
            </div>
            <div class="overflow-x-auto"> 
                <table>
                    <thead class="Header">
                        <tr class="pb-2">
                            <th  class="mb-2">
                                <s-checkbox v-model="select_all" @select="hnd_toggle_select_all" data-title="Select All"></s-checkbox>
                            </th>
                            <th class="Status mb-2" >Id</th>
                            <th class="Status mb-2" >Status</th>
                            <th  class="mb-2" v-for="(ftype,index) in fields_types" :key="ftype.field_name+index" :data-title="ftype.field_name">  {{  capitalize (  ftype.field_name, 12  ) }}   </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="entry in form_entries" :key="entry.id+'entry'" > 
                            <td>
                                <s-checkbox @select="hnd_select_formdata(entry.id, $event)" v-model="entry.selected"></s-checkbox>
                            </td>
                            <td class="p-1">
                                <span class="text-micro">{{  entry.id }}</span>
                            </td>
                            <td> 
                                <nuxt-link :data-title="'Edit ' + entry.id" :to="`/user/form/edit?id=${entry.id}&form_id=${form_descriptor.post_id}`" class="sm tag" :class="[entry.status]">  
                                {{ entry.status }}</nuxt-link>
                                <div class="text-xs mt-2">
                                    <span class="user-select-none color-gray-500">{{  entry.created_by_name || "Public" }}</span>
                                </div>
                            </td>
                            <td v-for="ftype in fields_types">
                                <span class="text-sm" v-html=" get_fxt(entry, ftype.field_name)">  </span>
                                
                            </td> 
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="flex justify-end p-2 gap-2" v-if="form_entries">
                <s-select v-model="cur_limit" :values="pagination_limits"></s-select>
                <s-select v-model="cur_page" :values="pagination_values" @select="hnd_pagination_select">
                     
                </s-select>
            </div>
             
        </div>
        <div>

            
             
        </div>
    </div>    
</template>

<script setup>
import { useMainStore } from "~/store";
import util from "~/assets/js/util"
 

const route = useRoute(); //route.params.<NAME>, route.title.<NAME>
 
 
 
const store = useMainStore()




useOnPageReady();
var cur_page = ref(route.query.p || 1)
var cur_limit = ref(route.query.limit|| 10)

var form            = ref ( await store.load_form({ post_id : route.params.form_id }) )
var fields_types    = computed(()=>{
    var out = []
    if (form.value ) {
        for ( var fname of Object.keys(form.value)){
            if ( fname == '__meta') continue; 
            out.push ( form.value[fname])
        }
    }
    return out 
})
var form_descriptor = computed(()=>{
    if ( ! form.value ) return {}
    return form.value.__meta 
})
var get_field = computed(()=>{
    return name=>{
        if ( ! form.value ) return {} 
        var form_meta = form.value.__meta ;
        if ( ! form_meta ) return {}
        var fld = form_meta [name ] || {}
        return fld 
    }
})

/**
 * Given a form entry ( submission ), return a specific field name's value
 */
var get_fx = computed(()=>{
    return (entry, field_name)=>{
        var value = null; 
        if ( ! entry || ! field_name) return value; 
        if ( ! entry.metas ) return value; 
        var meta = entry.metas.find ( m => m.name == field_name ) || null; 
        if ( ! meta ) return `<${field_name} Not Found>`
        value = meta.value; 
        return value; 
    }
})
let get_fxt = computed(()=>{
    return (entry, field_name)=>{
        var value = null; 
        if ( ! entry || ! field_name) return value; 
        if ( ! entry.metas ) return value; 
        var meta = entry.metas.find ( m => m.name == field_name ) || null; 
        if ( ! meta ) return `<${field_name} Not Found>`
        
        value = meta.value; 
        
        if ( typeof value == 'string' ){
            var last = value.length-1
            if ( (value.charAt(0)    =='[' || value.charAt(0)    =='{') && 
                 (value.charAt(last) ==']' || value.charAt(last) =='}') ){
                value = JSON.parse(value)
                var tmp = '',clz='', tmp_value; 
                for(var i=0; i < value.length; i++){
                     tmp_value = value[i].toLowerCase() 
                    tmp += `<span class="tag ${tmp_value}">${value[i]}</span> `
                }
                return tmp 
            }
        }
        
        
        return value; 
    }
})



  
var selected_submissions = ref([])
const hnd_select_formdata =(submission_id,event )=>{
    var x = selected_submissions.value 

    var index = x.indexOf( submission_id);
    index == -1 ? x.push(submission_id) : x.splice(index,1)
    select_all.value = x.length == form_entries.value.length 
}
var select_all = ref(false)
const hnd_toggle_select_all = ()=>{
    var is_all = select_all.value; 
    selected_submissions.value = []
    var x = selected_submissions.value 

    var entry; 
    for(var i=0; i < form_entries.value.length; i++){ 
        entry = form_entries.value[i]; 
        entry.selected = is_all
        if ( is_all ) x.push( entry. id )
    }
}

let bulk_action = ref('')
let bulk_action_types = ref([
    { title : "Submitted", value : "submitted"},
    { title : "Publish", value : "publish"},
    { title : "Completed", value : "completed"},
    { title : "Draft", value : "draft"},
    { title : "Active", value : "active"},
    { title : "Incomplete", value : "incomplete"},
    { title : "Pending", value : "pending"},
    { title : "Other", value : "other"},
    { title : "Pending", value : "pending"},
    { title : "Delete", value : "delete"},
])
let get_selected_entries = ()=>{
    var out = []
    var sels = selected_submissions.value; 
    var id, entry;
    for ( var i=0; i < sels.length; i++){
        id = sels[i];
        entry = form_entries.value.find ( it => it.id == id ) || null; 
        if ( ! entry ) continue; 
        out.push(entry)
    } 
    return out ;
}
let hnd_bulk_status = (new_status )=>{

    var sels = get_selected_entries()  
    var arr = [];
    for( var i=0; i < sels.length; i++){ 
        arr.push({ id : sels[i].id , status : new_status })
    }

    store.modify_post ( arr ).then ( async (res) =>{
       await  load_form_entries()
       form_entries.value?.forEach( entry =>{
        if( selected_submissions.value.includes( entry.id) )entry.selected = true; 
       })
    })
}


const page_data = store.page_data;



let post_type = route.params.type ; 
var form_entries = ref([])
let capitalize =  useCapital () 

let tb_options = ref({
  columns : [
    { name : 'id', width: '30px'}, 
    { name : 'group_id', width: '60px'},
    { name : 'title'},  
    {name: 'status'}]
})
 
let load_form_entries = async () =>{
    var form_id = route.params.form_id;
    form_entries.value = await store.load_posts({ parent_id : form_id, meta : true , limit : route.query.limit, p : route.query.p }) 

}
 await load_form_entries ();

let { pages : pagination_values, 
      limits: pagination_limits } =  useWatchLimitP( form_entries, cur_page, cur_limit,  load_form_entries )

let hnd_pagination_select = ()=>{
    //cur_page.value

}
definePageMeta({
    title : "Post ",
   layout: "user", //override page layout or use  setPageLayout('custom')
   middleware : [
    "auth",
    async (to, from)=>{ 
        let store = useMainStore(); 
        var limit = to.query.limit || 10
        var p     = to.query.p || 1 
        var q = { type : to.params.type, limit , p , slug : to.params.form_id }  
        store.load_posts(q)
        await store.process_post(to, { native:true}  )
    }
   ]
});
 



useHead({
  title:  "Form - " + route.params.form_id  ,
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
<style scoped>
.form-row {
    display: grid;
    gap: 0.25em;
    padding: 0.25em;
}
.Header {
    font-weight: 700;
    font-size: 0.75em;
}
.Data { 
    font-size: 0.85em;
}
.form-data-table {
    margin: 0.50em 0em 0.75em 0em;
}
</style>