<template>
    <div class="page">
        <h1  class="md:flex flex">Dashboard</h1>

        <div class="">
          <nuxt-link :to="'/'">Website</nuxt-link>
        </div>
      

        <div class="card my-4" style="min-height: 25em;">
          <p >JxtPress development mode - <span class="tag" data-title="Version 1.5">version</span></p>
          <div class="spinner" min="4" max="15" step="2.5" @change="hnd_spinner_changed">
            <input value="6.125" >
            <div class="controls"> 
              <button type="button" class="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
                  stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg> 
              </button>

              <button type="button" class="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          </div>

          <div id="editor"></div>
          <s-compile></s-compile>
        
        </div>

    </div>    
</template>

<script setup>
import { useMainStore } from "~/store";


 let store = useMainStore()
let hnd_spinner_changed =(e)=>{
  
}
const route = useRoute(); //route.params.<NAME>, route.title.<NAME>
 
useOnPageReady();

definePageMeta({
  title : "Dashboard ",
   layout: "user", //override page layout or use  setPageLayout('custom')
   middleware :  [ 
    "auth" ,
    async (to, from)=>{
 
        //rewrite the url such that "post_type" is not in the url;
        //  this is because in the database, the url is stored alone without "/{post_type}" prefix
        var url = to.path 
       
        let store =  useMainStore() 
        
        await store.process_post({ type: 'admin-page', 
          url  , 
          full_url : to.fullPath, 
          query:to.query, 
          param :to.params 
        },{ native:false});

    }
  
  ]
});

//After the Home page post is rendered, use this to prevent prep what the user sees
// we do not want to display 404 message on the dashboard, so if the admin has not created a 
// dashboard page yet, just hide the 404 messaing
let check_dashboard_home_page_post = ()=>{
  if(store.rendered_post && store.rendered_post.__is_404){
    store.rendered_post.rendered = ''
  }
}
await check_dashboard_home_page_post()


useHead({
  title: "Dashboard",
  meta: [
  
  ],
  bodyAttrs: { 
  },
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

</style>