<template>
    <div class="page">
        <h1  class="md:flex flex"> {{ capitalize(post_type) }} List </h1>
 

        <div class="card my-4"> 
          <nuxt-link class="button primary flat rounded p-2 mb-2" :to="'/user/posts/edit?id='+post_type">New</nuxt-link>
          <s-table v-model="store.posts" :options="tb_options" :base_url="'/user/posts/'+post_type" 
            @pagination="refresh_post_list"
            >
            <template #title="{row}">
              <div class="mb-3 post-title" :data-title="row.description || 'No description'">
                <span>{{ row.title }}</span>
                <span v-if="row.amount != null"> - {{  row.amount }}</span>
              </div>
              <div>
                <span class="tag" v-if="url(row) != '#'" > {{url(row)}}</span>
                
              </div>
            </template>
            <template #group_id="{row}">
              <div>{{ row.group_title || "Empty"}}</div>
            </template>
            <template #status="{row}">
              <span :class="['tag','status', row.status]" 
              :data-title="access( row)">{{ row.status || "Empty" }}</span>
              <br>
              <span class="tag success" v-if="is_public(row, 'read')" data-title="Everyone can view">Public</span>
            </template>

            <template #child_count="{row}">

              <nuxt-link :to='`/user/form/${row.id}?p=1&limit=50`'>{{ row.child_count || 0 }}</nuxt-link>
            </template>
            <template #action="{row}"> 
                <a class="mr-2 text-sm" @click="hnd_before_edit_navigation(row, $event)" :href="'/user/posts/edit?id='+row.id">edit</a>
                <a class="mr-2 text-sm" v-if="row.type=='product'" :href="`/user/products/${row.id}`">product</a>
                <nuxt-link class="mr-2 text-sm" :to="url(row)">view</nuxt-link>
                <nuxt-link class="mr-2 text-sm" to="#" @click="hnd_remove_post(row, $event)">delete</nuxt-link> 
            </template>

          </s-table>

        </div>
    </div>    
</template>

<script setup>
import { useMainStore } from "~/store";
import util from "~/assets/js/util"

let url = computed(()=>{
  return (row)=>{
    if ( row.type =='layout') return '#'; 
    if ( ! row.url) return "#"
    switch(row.type){
      case 'admin-page':
        return `/user${row.url }`
      case 'media':
      case 'page':
        return row.url ;
      default: 
        return `/${row.type}${row.url}`; 
    }
  }
})

const store = useMainStore()

const page_data = store.page_data;

 

useOnPageReady();



const route = useRoute();  
let post_type = route.params.type ; 
let capitalize =  useCapital () 

let tb_options = ref({
  columns : [
    { name : 'id', width: '30px'}, 
    { name : 'group_id', width: '60px'},
    { name : 'title'},  
    {name: 'status'}
  ]
})

if ( route.params.type == 'form') { 
  tb_options.value.columns.splice(4,0, { name : 'child_count', title :'Data' , width: '100px'})
}

 
definePageMeta({
    title : "Post ",
   layout: "user", //override page layout or use  setPageLayout('custom')
   middleware : [
    "auth",
    async (to, from)=>{ 
        let store = useMainStore();
        await store.process_post(to, { native:true})
    }
   ]
});


let refresh_post_list = async ( options )=>{
  options.limit = route.query.limit 
  options.type = route.params.type 
   
  await store.load_posts(options)
}
await refresh_post_list( {  p : route.query.p } )
let hnd_remove_post = (post, e)=>{
  e.preventDefault();
  
  useRequest({url: "/api/posts",  method: 'delete', body : { id : post.id }}).then((ret)=>{

    for(var i=0; i < store.posts.length; i++){
      if ( store.posts[i].id == post.id ) {
        if ( ret.outcome ) {
            store.posts.splice(i,1);
        }else {
            store.posts.splice(i,1,ret.d)
        }
      }
    }
  })
 
  
  return ;
}

let hnd_before_edit_navigation = (post, event)=>{

  if ( post.type == 'media'){ 
    event.preventDefault()
    event.stopPropagation() 
    util.open_media({ 
      selected : [ { url : post.url , id : post.id } ]
    })
  } 
}
let is_public = computed(()=>{
  return (post,action)=>{
    if ( ! Array.isArray(  post.access) ) return false;
    for(var i=0; i < post.access.length; i++){
      if ( post.access[i][action + '_group'] == null) return true; 
    }
    if (post.access.length == 0) return true 
    return false;
  }
})
let access = computed(()=>{
  return (post)=>{
    if ( ! Array.isArray(post.access)) return "";
    var aread = [] , aupdate =[], adelete = [], name; 
    for(var i=0; i < post.access.length; i++){
      
      if ( post.access[i].read_group == null){
        name = "Public" 
      }else {
        name = post.access[i].read_title 
      }
      if (! aread.includes(name) ) aread.push( name )

      if ( post.access[i].update_group == null){
        name = "public "
      }else {
        name = post.access[i].update_title 
      }
      if (! aupdate.includes(name) ) aupdate.push( name  )

      if ( post.access[i].delete_group == null){
        name = "Public" 
      }else {
        name = post.access[i].delete_title 
      }
      if (! adelete.includes(name) ) adelete.push(  name )
    }
    var C='class="tag"'
    if ( aread.length == 0) aread.push('Public')
    if ( aupdate.length==0) aupdate.push('Public')
    if ( adelete.length==0) adelete.push('Public')
    var html = `Permission(s): Read (${aread.join(',')}), Update (${aupdate.join(',')}), Delete (${adelete.join(',')})`
    return html 
  }
})
useHead({
  title: store.rendered_post.title || "Post - " + route.params.type  ,
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