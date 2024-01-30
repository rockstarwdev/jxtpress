<template>
    <div class="page ty" :class="[ ta ]">

      
      <s-compile></s-compile>

    </div>    
</template>

<script setup>
import { useMainStore } from "~/store";
import util from "~/assets/js/util"



const store = useMainStore()
const page_data = store.page_data;



useOnPageReady();


let ta= computed(()=>{
  return  ( store.rendered_post) ? store.rendered_post.type :  null; 
})
const route = useRoute(); //route.params.<NAME>, route.title.<NAME>
 
 
definePageMeta({
   title : "Post ",
   layout: "default", //override page layout or use  setPageLayout('custom')
   middleware : [
    "auth",
    async (to, from)=>{
        var post_type = to.params.post_type
 
        var slug = to.params.slug ;
        //rewrite the url such that "post_type" is not in the url;
        //  this is because in the database, the url is stored alone without "/{post_type}" prefix
        var url =`/tags/${slug}` ;//ThE URL we need to load
 
        let store = useMainStore()  
        await store.process_post({ 
          type: post_type,  url  , 
          full_url : to.fullPath, slug, 
          query :to.query,   param :to.params 
        }, { native:false });

    }
   ]
});

 
useHead({
  title: store.rendered_post.title ,
  meta: [
    ... store.rendered_post.meta_seo
  ],
  bodyAttrs: {
    class: 'test'
  },
  script: [ { innerHTML: 'console.log(\'Hello world\')' }, 
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