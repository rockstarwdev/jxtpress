<template>
    <div class="page ty post-type slugs" :class="[ ta ]">

      

      <s-frontend-bar></s-frontend-bar>
        <s-compile></s-compile>

    </div>    
</template>

<script setup>
import { useMainStore } from "~/store";
import util from "~/assets/js/util"

useOnPageReady();

let url = computed(()=>{
  return (row)=>{
    return  ( row.type !='page' ? '/'+row.type : '' ) +   row.url
  }
}) 
const store = useMainStore()

const page_data = store.page_data;


 
let ta= computed(()=>{
  return  ( store.rendered_post) ? store.rendered_post.type :  null; 
})
 
definePageMeta({ 
   layout: "default", // override page layout or use  setPageLayout('custom')
   middleware : [ 
    async (to, from)=>{
        var post_type = to.params.post_type
 
        var slugs = !Array.isArray(to.params.slugs) ? [to.params.slugs] : to.params.slugs;
        //rewrite the url such that "post_type" is not in the url;
        //  this is because in the database, the url is stored alone without "/{post_type}" prefix
        var url =`/${slugs.join('/')}` ;//ThE URL we need to load
        //console.log ("Request URL", url )
        let store = useMainStore()  
        await store.process_post({ type: post_type, 
          url  , 
          full_url : to.fullPath, slug : slugs, 
          query:to.query, 
          param :to.params 
        },{ native: false} );

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
<script>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  mounted(){
    console.log ("Additional logic for M.O.U.N.T.E.D")
  }
})
</script>
