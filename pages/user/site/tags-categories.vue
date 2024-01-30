<template>
 
    <div class="page">
        
 
        <h1  class="md:flex flex mb-4">Tags</h1>  
         
        <s-drawer-and-content>
            <template #pocket>
                <s-input v-model="search_tag" placeholder="Search tag"></s-input>
                <ul class="list hover  overflow-auto max-height-250 mt-3">
                    <li class="pointer flex justify-between row-item" v-for="tag in computed_tags"
                        
                        :key="'tag-'+tag.id" @click="hnd_edit_tag(tag)">
                        <div> 
                            <span class="mr-4">{{  tag.title  }}</span>
                            <span class="badge bg-gray-200" v-if=" tag.count>0">{{  tag.count }}</span> 
                        </div>
                        <div>
                            <button class="trash-it sm danger button hidden" @click="hnd_delete_tag(tag)" :data-title="'Delete Tag ' +tag.id">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
                                stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    </li>
                    <li v-if="computed_tags.length==0">
                            <div class="color-gray-300">No tags</div>
                    </li>
                </ul>
            </template>
            <template #content>
                <div v-if="!active_tag" class="h-full flex justify-center items-center">
                    <div class=""> 
                        <p class="  opacity-40">Please select a tag to see details</p>
                        <div class="flex justify-center">

                            <button class="button" @click="hnd_edit_tag({})">Add Tag</button>
                        </div>
                    </div>
                </div>
                <div v-else>

                    <div class="row"> 
                        <div class="label">Tag</div>
                        <s-input v-model="active_tag.title" placeholder="Tag">Tag</s-input>
                    </div>
                    <div class="row"> 
                        <div class="label">Description</div>
                        <s-textarea v-model="active_tag.description" placeholder="Tag"></s-textarea>
                    </div>
 
                    <div class="my-9"></div>
                    <div class="flex  items-center gap-2 my-2 mt-2"><h3>Related</h3>   <span class="mr-1 badge bg-primary-700 color-white">{{ active_tag.count||0 }}</span>
                    
                        <s-select v-model="tag_post_Type" :values="computed_tag_types"></s-select>


                        <div v-if="active_tag.id" class="view-category my-2">
                            <nuxt-link :to="`/tags/${active_tag.title}`">view</nuxt-link>
                        </div>

                    </div>
                    <ul class="related list border max-height-250 overflow-auto">
                        <li v-for="related in filtered_tag_associated_posts " :key="'related'+related.id">
                            <div class="title">
                                <template v-if="is_viewable(related)">
                                    <nuxt-link :to="related.url ||'#'">{{  related.title }}</nuxt-link>
                                </template>
                                <template v-else>{{ related.title }}</template>
                                
                            
                            </div>
                            <div class="mt-2"> 
                                <span class="tag mr-4">{{  related.type || "empty" }}</span>
                                <nuxt-link class="text-sm font-light" :to="'/user/posts/edit?id='+ related.id">edit</nuxt-link>
                            </div>
                        </li> 
                    </ul>
                    <div class="save flex justify-end mt-2">
                        <button type="button" class="button danger" @click="hnd_cancel_tag">Cancel</button>
                        <button type="button" class="button primary" @click="hnd_save_tag">
                            Save
                        </button>
                    </div>
                </div>
            </template>
        </s-drawer-and-content>
      


        <h1  class="mt-9 md:flex flex mb-4">Categories</h1>  
         
        <s-drawer-and-content>
            <template #pocket> 
                <s-input v-model="search_category" placeholder="Search category"></s-input>
                <ul class="list hover  overflow-auto max-height-250 mt-3">
                    <li class="pointer flex justify-between row-item" v-for="cat in computed_categories" 
                            :key="'cat-'+cat.id" @click="hnd_edit_category(cat)">
                        <div> 
                            <span>{{  cat.title || `Untitled Category (${cat.id})` }}</span>
                            <span class="badge bg-gray-200 ml-2" v-if=" cat.count>0">{{  cat.count }}</span> 
                        </div>

                        <div> 
                            <button class="trash-it sm danger button hidden"  @click="hnd_delete_category(cat)" :data-title="'Delete Tag ' +cat.id">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" 
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    </li> 

                    <li v-if="computed_categories.length==0">
                        <div class="color-gray-300">
                            No categories
                        </div>
                    </li>
                </ul>
            </template>
            <template #content>
                <div v-if="!active_category"  class="h-full flex justify-center items-center">
                    <div class=""> 
                        <p class="  opacity-40">Please select a category to see details</p>
                        <div class="flex justify-center">

                            <button class="button" @click="hnd_edit_category({})">Add Category</button>
                        </div>
                    </div>
                </div>
                <div v-else>
                    

                    <div class="row"> 
                        <div class="label">Category</div>
                        <s-input v-model="active_category.title" placeholder="Title">Category</s-input>
                    </div>
                    <div class="row"> 
                        <div class="label">Slug</div>
                        <s-input v-model="active_category.slug" placeholder="slug">Slug</s-input>
                    </div>

                    <div class="row"> 
                        <div class="label">Description</div>
                        <s-textarea v-model="active_category.description" placeholder="Description"></s-textarea>
                    </div>
 

                    <div class="row">
                        <div class="label">Parent</div>
                        <s-select v-model="active_category.parent_id" :values="computed_category_parents"></s-select>
                    </div>

                    <div class="my-9"></div>
                    <div class="flex  items-center gap-2 my-2 mt-2"><h3>Related</h3>   <span class="mr-1 badge bg-primary-700 color-white">{{ active_category.count||0 }}</span>
                        
                        <s-select v-model="cat_post_Type" :values="computed_category_types"></s-select>

                        <div v-if="active_category.id" class="view-category my-2">
                            <nuxt-link :to="`/categories/${active_category.slug}`">view</nuxt-link>
                        </div>
                    </div>


                    <ul class="related list border max-height-250 overflow-auto">
                        <li v-for="related in filtered_category_associated_posts " :key="'related'+related.id">
                            <div class="title"> 
                                <template v-if="is_viewable(related)">
                                    <nuxt-link :to="related.url ||'#'">{{  related.title }}</nuxt-link>
                                </template>
                                <template v-else>{{ related.title }}</template> 
                            </div>
                            <div class="mt-2"> 
                                <span class="tag mr-4">{{  related.type || "empty" }}</span>
                                <nuxt-link class="text-sm font-light" :to="'/user/posts/edit?id='+ related.id">edit</nuxt-link>
                            </div>
                        </li> 
                    </ul>
                    <div class="save flex justify-end mt-2">
                        <button type="button" class="button danger" @click="hnd_cancel_category">Cancel</button>
                        <button type="button" class="button primary" @click="hnd_save_category">
                            Save
                        </button>
                    </div>


                </div>
            </template>
        </s-drawer-and-content>
 
        <s-compile></s-compile>

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
  title: store.rendered_post.title ||"Tags & Categories" ,
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

let is_viewable = computed ( ()=>{
    return post =>{
        if ( ! post ) return false; 
        if ( ['layout'].includes(post.type )) return false;
        return true; 
    }
}) 

let search_tag = ref("")
let tag_post_Type = ref("all")
let tags = ref ( [])
let active_tag = ref(null)
let tag_associated_posts = ref([])
 let computed_tags = computed( ()=>{
    var arr = tags.value || [];
    var text = search_tag.value ;
    if ( text.length < 2) return arr;

    return arr.filter ( it => {
        return it.title && it.title.toLowerCase().includes(text )
    })
 })
 let computed_tag_types = computed(()=>{

    var arr = tag_associated_posts.value || [];
    var types = [{title : "All",value : "all"}];
    var type 
    for ( var i=0; i < arr.length; i++){
        var t = { title : arr[i].type, value : arr[i].type }
        if ( ! types.find (it => it.value == arr[i].type)) types.push(t)
    }
    return types 
 })
 let refresh_tags = async ()=>{
    tags.value = await store.load_tags()
 }
 await refresh_tags()
 let hnd_delete_tag = async (tag)=>{
    if ( ! tag) return 
    var res = await util.open_modal({
        content : `<p>Are you sure you want to delete tag "<b>${tag.title}</b>" (${tag.id})</p>`,
        cancel : "Cancel", ok : "Delete" 
    })
    if ( res.action = 'ok') {
        store.remove_tag({ id : tag.id })
        refresh_tags();
    }
 }
 let hnd_edit_tag = async (tag)=>{ 

    active_tag.value = tag//copy
    tag_post_Type.value = 'all'
    tag_associated_posts.value = []
    if ( ! tag ) return ; 
    if ( tag.id ) {
        var res = await useRequest({ url: "/api/site/related-posts?tag="+tag.id })
        tag_associated_posts.value  = res.d;
    }
 }
 let filtered_tag_associated_posts = computed(()=>{
    var out = tag_associated_posts.value;
    if (tag_post_Type.value == 'all')return out;

    return out.filter ( it => it.type == tag_post_Type.value )
 })
 let hnd_cancel_tag = ()=>{
    active_tag.value = null; 
 }
 let hnd_save_tag =async ( )=>{ 
    if ( ! active_tag.value ) return ;
    await store.modify_tag(active_tag.value);
    await refresh_tags() 
 }

















 //-------------------------------------------------
 // Categories 
 //-------------------------------------------------
 let search_category        = ref("")
 let categories             = ref([])
 let active_category        = ref(null);
 let cat_associated_posts   = ref(null)
 let cat_post_Type          = ref("all")

 let computed_category_parents = computed(()=>{ 
    var src      = categories.value || [] ;
    var arr = []
    arr.push({ title : "None", value : null })
    for ( var i=0;i < src.length; i++){
        if ( src[i].id == active_category.value?.id) {
            continue; 
        }
        arr.push( src[i])
    }
    return arr; 
})

let refresh_categories = async ()=>{
    categories.value = await store.load_categories({})
}
let computed_categories = computed(()=>{
    var arr     = categories.value || [];
    var text    = search_category.value ;
    if ( text.length < 2) return arr;

    return arr.filter ( it => {
        return it.title && it.title.toLowerCase().includes(text )
    })
})
await refresh_categories()
let hnd_edit_category = async (cat) =>{
    active_category.value = cat ;
    cat_post_Type.value = "all"
    cat_associated_posts.value = [] 
    if ( ! cat ) return 

    if ( cat.id ) {
        var res = await useRequest({url:"/api/site/related-posts?category="+cat.id })
        cat_associated_posts.value  = res.d;
    }

}
let filtered_category_associated_posts = computed(()=>{
    var out = cat_associated_posts.value;
    if (cat_post_Type.value == 'all') return out;

    return out.filter ( it => it.type == cat_post_Type.value )
})
let hnd_save_category = async ()=>{
    if ( ! active_category.value ) return ;
    await store.modify_category(active_category.value);
    await refresh_categories() 
}
let hnd_delete_category = async (cat) => {
    if ( ! cat) return 
    var res = await util.open_modal({
        content : `<p>Are you sure you want to delete category "<b>${cat.title}</b>" (${cat.id})</p>`,
        cancel : "Cancel", ok : "Delete" 
    })
    if ( res.action = 'ok') {
        await store.remove_category({ id : cat.id })
        await refresh_categories();
        if ( active_category.value && active_category.value.id == cat.id ){
            hnd_edit_category(null)
        }
    }
}

let hnd_cancel_category = async ()=>{
    active_category.value = null; 
}
 
 
 let computed_category_types = computed(()=>{

    var arr = cat_associated_posts.value || [];
    var types = [{title : "All",value : "all"}];
    var type 
    for ( var i=0; i < arr.length; i++){
        var t = { title : arr[i].type, value : arr[i].type }
        if ( ! types.find (it => it.value == arr[i].type)) types.push(t)
    }
    return types 
 })

</script>
<style scoped>

</style>

