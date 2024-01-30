<template>
    <div class="page">
        <h1  class="md:flex flex color-red-500">Access Denied</h1>
 
        <div class="card my-4">
            <p> The resource at <span class="tag">{{ $route.query.url || "unknown" }}</span> is restricted and requires 
                <span class="tag danger">{{ $route.query['required-access']  }}</span> capability in order to access it. </p>
        </div>

        <div class="card my-4" style="min-height: 25em;" v-if="store.rendered_post && store.rendered_post.rendered_post">
        
        <s-compile></s-compile>

        </div>

    </div>    
</template>

<script setup>
import { useMainStore } from "~/store";


 let store = useMainStore()

 useOnPageReady();
const route = useRoute(); //route.params.<NAME>, route.title.<NAME>
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
check_dashboard_home_page_post()


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