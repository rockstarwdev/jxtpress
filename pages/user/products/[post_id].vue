<template>
    <div class="page">
        <h1  class="md:flex flex">  Product </h1>
 

        <div class="card my-4"> 
            <div class="row flex gap-2">
                <div class="w-1/3">Name</div>
                <div class="w-2/3">
                    <s-input v-model="product.title"></s-input>
                </div>
            </div>

            
            <div class="row flex gap-2">
                <div class="w-1/3">Description</div>
                <div class="w-2/3">
                    <s-textarea v-model="product.description" height="100px"></s-textarea>
                </div>
            </div>
            <div class="row flex gap-2">
                <div class="w-1/3">Brand </div>
                <div class="w-2/3">
                    <s-input  v-model="product_brand"></s-input>
                </div>
            </div>
             

            <div class="row flex gap-2">
                <div class="w-1/3">Status</div>
                <div class="w-2/3">
                    <s-select v-model="product.status" :values="statuses"></s-select>
                </div>
            </div>
            <div class="row flex gap-2">
                <div class="w-1/3">Page Layout</div>
                <div class="w-2/3">
                    
                    <div class="color-gray-400 mt-2" v-if="!product.layout">
                        <p>Using default layout for product page</p>
                    </div>
                    <s-select v-model="product.layout" :values="layouts" ></s-select>
                </div>
            </div>
            <div class="row flex gap-2">
                <div class="w-1/3">Group </div>
                <div class="w-2/3">
                    <s-select v-model="product.group_id" :values="groups"></s-select>
                </div>
            </div>

            <div class="row flex gap-2">
                <div class="w-1/3">Tags </div>
                <div class="w-2/3">
                    <s-input v-model="product.tags" ></s-input>
                </div>
            </div>
            <div class="row flex gap-2">
                <div class="w-1/3">URL </div>
                <div class="w-2/3">
                    <s-input  v-model="product.url" >
                        <template #prefix>/product</template>
                    </s-input>
                </div>
            </div>
             
            <div class="row flex gap-2">
                <div class="w-1/3">Inventory Count</div>
                <div class="w-2/3">
                    <s-input type="number" v-model="product_inventory"></s-input>
                </div>
            </div>
             
            <div class="my-3 divider">&nbsp;</div>
            <div class="accordion-item mb-3 ">
                <h4 class="title bg-gray-50 hover:bg-gray-100 mb-1">Price</h4>
                <div class="content">
                    <div class="row flex gap-2 ">
                        <div class="w-1/3"> </div>
                        <div class="w-2/3">

                            <div class="flex justify-between mb-4 mt-2">
                                <div class="">
                                    <div>Base price</div>
                                    <s-input type="number" v-model="product.amount"  placeholder="Base price"></s-input>
                                </div>

                                <div class="mb-2 ">
                                    <div>&nbsp;</div>
                                    <button type="button" class="button primary" @click="hnd_add_price">Add Price</button>
                                </div>
                            </div>
                            
                            <div class="p-4 flex justify-center" v-if="is_loading_prices">
                                <div class="loader primary sm"></div> 
                            </div>

                            {{  default_price }}
                            <template v-for="(price,pi) in prices"  :key="price.id+pi " >
                                <s-price v-model="prices[pi]" @change="hnd_price_changed" 
                                :class="[is_default_price(price) ? 'selected': '']" @favorite="hnd_set_default_price">  </s-price>
                            </template>
                            
                        </div>
                    </div>
                </div> 
            </div> 
            <div class="accordion-item mb-3">
                <h4 class="title bg-gray-50 hover:bg-gray-100 mb-1">Meta Properties</h4>
                <div class="content">
                    <div class="row flex gap-2">
                        <div class="w-1/3"></div>
                        <div class="w-2/3">
                            <button type="button" class="button primary" @click="hnd_add_custom_meta">Add Meta</button>
                            <div class="text-sm color-gray mb-4">Add variations for products by prefixing the the property name with <span class="tag">variations_</span></div>
                            <template v-for="(meta,index) in custom_metas" :key="'index'+index">
                                <div class="flex row-item gap-2 items-start">
                                    <button type="button" class="button hidden danger" @click="hnd_remove_meta_property(meta,index)">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
                                        stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>

                                    </button>
                                    <s-meta v-model="custom_metas[index]" class="flex-1"></s-meta>
                                    
                                </div>
                                <template v-if="is_meta_advanced(custom_metas[index])">
                                    <div class="text-sm color-gray-400 pl-9 mb-3">
                                        It is recommended to use only strings for any meta properties shared with external API
                                    </div>
                                </template>
                            
                            </template>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row flex gap-2 mb-4">
                <div class="w-1/3">Images</div>
                <div class="w-2/3">
                    <div class="little-day">
                        <button class="button mb-1" @click="hnd_new_image">Add Image</button>
                    </div>
 
                    <div class="w-full mb-1" v-for="(img,index) in images_arritem.value " :key="'image'+index"> 
                        <s-input v-model="images_arritem.value[index]" class="w-full"></s-input> 
                    </div>
                </div>
            </div>
            <div class="row flex gap-2">
                <div class="w-1/3"><span data-title="Virtual(false)">Shippable</span></div>
                <div class="w-2/3">
                    <s-checkbox @change="hnd_shippable_changed" v-model="shippable"  >Physical Product</s-checkbox>
                </div>
            </div>
            <div class="row flex gap-2 mb-9">
                <div class="w-1/3"><span data-title="Subscription product">Subscription</span></div>
                <div class="w-2/3">
                    <s-checkbox @change="hnd_subscription_changed" v-model="subscription"  >Is Subscription</s-checkbox>
                </div>
            </div>
            <div class="row flex gap-2">
                <div class="w-1/3">Tax Code </div>
                <div class="w-2/3">
                    <s-input v-model="tax_code"  ></s-input>
                </div>
            </div>
            <div class="row flex gap-2">
                <div class="w-1/3">Statement Descriptor</div>
                <div class="w-2/3">
                    <s-input v-model="statement_descriptor"  ></s-input>
                </div>
            </div>

            <div class="row flex gap-2 mt-4">
                <div class="w-1/3 color-gray-500">External ID</div>
                <div class="w-2/3">
                   <span class="tag">{{  product.eid }}</span>
                </div>
            </div>
         

            <template v-if="store.rendered_post"> 
                <s-compile></s-compile>
            </template> 

            <div class="row flex gap-2 mt-4">
                <div class="w-1/3"></div>
                <div class="w-2/3">
                    <button type="button" class="button primary" @click="hnd_save_product">
                        Update
                    </button>
                </div>
            </div>
        </div>
    </div>    
</template>

<script setup>
import { useMainStore } from "~/store";
import util from "~/assets/js/util"
 const route = useRoute()
 const store = useMainStore()
 
 
useOnPageReady();


const product = ref(  null ) 
const custom_metas = ref([]) 
const is_loading_prices = ref(false)
const prices = ref ([])
const layouts = ref(await store.load_layouts() ||  [])
layouts.value.splice(0,0, { title : "None", id : null })

const get_product = computed(()=>{
    return {
        ... product.value , metas : prices.value || []
    }
})
let initialize_cust_metas = ()=>{
    var exclusion = [ 'images_arritem','feature_image','statement_descriptor','default_price',
    'shippable','layout','tax_code' , 'inventory', 'brand' ]
    var must_include = [ { name : "sponky", value : ""}  ]
    custom_metas.value = []
    var name , m 
    for ( var i=0; i < product.value.metas.length; i ++){
        m = product.value.metas[i ]
        if (  exclusion.includes(m.name)) continue; 
        if ( ! custom_metas.value.find(it => it.name == m.name )) custom_metas.value.push( m  )
    }
    for ( var i=0; i < must_include.length; i++){
        m = must_include[i];
        if ( ! m.name) continue; 
        if ( ! custom_metas.value.find(it => it.name == m.name)) {
            custom_metas.value.push(m )
        }
    }
}
let hnd_add_custom_meta = (e)=>{
    custom_metas.value.push( { name : "", value : "" })
    util.trigger('refresh',e.target)
}
let hnd_remove_meta_property = (meta,index)=>{
    custom_metas.value.splice(index, 1)
    util.trigger('refresh',e.target)
}
let load_product = async ()=>{
    product.value = await store.load_post({ id : route.params.post_id }) 
    initialize_cust_metas()
}
await load_product()

let load_prices = async ()=>{
    is_loading_prices.value = true;
    var eid = product.value?.eid || null;
    if ( eid ) { 
        prices.value= (await useRequest({url: "/api/posts", query:{ linked_eid: eid , metas:true  } })).d 
    }else {
        prices.value = []
    }
    is_loading_prices.value = false; 
}
await load_prices();

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
let frequencies = ref([
    { title : "Days", value : "days"},
    { title : "Weeks", value : "weeks"},
    { title : "Months", value : "months"}, 
])
let statuses = ref([
    { title : "Active", value : "active" },
    { title : "Draft", value : "draft" },
    { title : "Archive", value : "archived" },
    { title : "Delete", value : "delete" },
])
let groups = ref(await store.load_groups() )
groups.value.splice(0,0, { title : "None", value : null })
 
let tax_code =   useMetaModel(product, "tax_code" )
let subscription = useMetaModel(product,'subscription')
let shippable =   useMetaModel(product, "shippable" )
let statement_descriptor = useMetaModel(product, "statement_descriptor", true )
let product_inventory = useMetaModel(product,'inventory',0)
let product_brand = useMetaModel(product,'brand',"")
let default_price = useMetaModel(product, 'default_price', null )
let images_arritem = ref({name : "images_arritem", value : [] })
if ( product.value && product.value.metas ) {
    for (var i=0; i < product.value.metas.length; i++){
        if ( product.value.metas[i].name == 'images_arritem'){
            images_arritem.value = product.value.metas[i]
        }
    }
}

 
let hnd_add_price = ()=>{
    prices.value.push({ type : "price" })
}
let hnd_price_changed = (price )=>{ 
}
let hnd_set_default_price = (price_eid)=>{
    if ( ! price_eid) return; 

    var old_default = default_price.value;
    if ( old_default == price_eid) price_eid = null; 
 
    default_price.value  = price_eid 
    console.log("\tFinal",default_price.value,)
}
let is_default_price = computed(()=>{
    return (price) => {
        var df_price = product.value.metas.find (it=> it.name == 'default_price')
        return price.eid == df_price.value 
    }
})
let hnd_shippable_changed = (val)=>{ 
}
let hnd_subscription_changed= (val)=>{

}
let hnd_new_image = ()=>{
    if (! images_arritem.value ){
        images_arritem.value = { name :"images_arritem", value:[] }
    }  
    images_arritem.value.value.push("") 
}
onMounted (()=>{
    window.$product = get_product
})
useHead({
  title: store.rendered_post.title || product.value.title  ,
  meta: [  ... store.rendered_post.meta_seo ],
  bodyAttrs: {   },
  script: [ ... store.rendered_post.head_scripts],
  link : [ ... store.rendered_post.links  ],
  style : [ ... store.rendered_post.head_style  ]
})

let hnd_save_product = async  ()=>{
    var is_new =! product.value.id 

    if ( ! product.value.metas)product.value.metas = [] 


    var found_images = false;
    var all_metas = [ ... custom_metas.value , ...  product.value.metas ]
    for(var i=0; i < all_metas.length; i++){
        if ( all_metas[i].name == 'images_arritem') {
            all_metas[i] = util.copy ( images_arritem.value )
            found_images = true;
        }
    }
    if ( !found_images) {
        all_metas.push( util.copy(images_arritem.value ))
    }

    let d = await store.modify_post( { ... product.value, metas : all_metas} )  
    product.value.metas = d.metas; 
    product.value.eid = d.eid; 
    initialize_cust_metas()

 
    if ( prices.value.length > 0 ){
        //link price to the produt eid 
        prices.value.forEach( p => p.linked_eid = d.eid )
        //update the batch of pricess
        prices.value = await store.modify_post(  prices.value  )
    }
    await load_prices()

    if ( is_new ) { 
        product.value.id = d.id; 
    }
}
let is_meta_advanced = computed(()=>{
    return meta =>{
        if ( ! meta ) return false; 
        if ( ! meta.name ) return false; 
        var name = meta.name
        return name.endsWith("arritem") || name.endsWith("arrobj")
    }
})
</script>
<style scoped>

</style>