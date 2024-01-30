<template>
    <div>
        

        <s-frontend-bar></s-frontend-bar> 
        <s-compile></s-compile>

    </div>    
</template>

<script setup>
import { useMainStore } from "~/store";
 
useOnPageReady();
const store = useMainStore()
  
useHead({
  title: store.rendered_post.title ||"Home" ,
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


definePageMeta({
  // layout: "custom", //override page layout or use  setPageLayout('custom')
  middleware : [
   async  (to, from)=>{ 
      let store = useMainStore() 
      await store.process_post({ 
        type      : 'page', 
        url       : to.path , 
        full_url  : to.fullPath, 
        query     : to.query, 
        param     : to.params 
      },{ native: false }) 
       
    }
  ]
});


</script>