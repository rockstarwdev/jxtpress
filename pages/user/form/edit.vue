<template>
    <div class="page">
        <h1>Form Data</h1>

        <p>
            <nuxt-link :to="'/user/form/'+$route.query.form_id" class="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                </svg>
            </nuxt-link>
        </p>

        <div class="card my-4"> 
            <div class="before-post mb-3" v-if="has_consumable">
                <div >Submitted by: <span class="font-bold">{{ consumable.__the_child.created_by_name }}</span></div>
                <div>Created <span class="text-sm">{{ utc_to_simple(  consumable.__the_child.created) }}</span>
                    Status <span class="tag" :class="[consumable.__the_child.status]">{{ consumable.__the_child.status }}</span>
                </div>
            </div>
            <template v-else>
                <div>Data not found</div>
            </template> 
            <s-compile></s-compile>

            <div class="after-post mt-7" v-if="has_consumable">
                <div>
                    Last modified <span class="text-sm">{{  utc_to_simple (consumable.__the_child.modified) }}</span>
                </div> 
            </div>
        </div>
    </div>
</template>
<script setup>
import { useMainStore } from "~/store";
import util from "~/assets/js/util"

let { utc_to_simple } = useTimeFormat()

const route = useRoute();  
const store = useMainStore()
  
 
useOnPageReady();


let has_consumable = computed(()=>{
    return store.rendered_post.consumable_child_data
}) 
let consumable = computed(()=>{
    return store.rendered_post.consumable_child_data
})

definePageMeta({
    title : "Post ",
   layout: "user", //override page layout or use  setPageLayout('custom')
   middleware : [
    "auth",
    async (to, from)=>{ 
        let store = useMainStore();
        await store.process_post({ 
            query : to.query,  params : to.params,
            post_id : to.query.form_id ,
            child_id : to.query.id 
        }, { native:true} );
    }
   ]
});




useHead({
  title:  "Form Data - " + route.query.id  ,
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