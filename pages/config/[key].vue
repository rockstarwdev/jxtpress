<template>
    <div class="container mx-auto my-6">
        <h1  class="text-center mb-4">Config</h1>
 
        <div class="flex flex-col justify-center items-center"> 
          <span class="tag text-md shadow" :class="access.d ? 'bg-green-500 color-green-50':'bg-red-500 color-red-50'">{{ input_key  }}</span>
          <p>Authorization code</p>
        </div>

        <div class="mb-6">
          <div v-if="access.d" class="authorized">
            <button class="button" type="button" @click="hnd_create">Create Site</button>
          </div>
          
          <div v-if="!access.d" class="unauthorized">
            Hmmm. {{  access.msg }}
          </div>
        </div>
         
    </div>    
</template>

<script setup> 
const route = useRoute(); //route.params.<NAME>, route.title.<NAME>
const input_key = ref (route.params.key); 

//useFetch
//  - takes function that returns url, options { method, params, query }
//  - returns { data, pending, error}

//$fetch
//  - takes url, and options
//  - returns actual returned value from endpoint

//const { authorized } = await useFetch(() => `/api/config/${count.value}`, { params: { token: 123 } })
//const out = await $fetch("/api/site/config/install", { method: "post" })
const access = ref ( await  $fetch(  `/api/site/config/install`, 
          { query : { key: input_key.value} }))

 
useOnPageReady();



const code = ref(config)
definePageMeta({
  // layout: "blank", //override page layout or use  setPageLayout('custom')
});
let hnd_create = async ()=>{
  console.log ("Tring to create")
  var res = await  useRequest({ url: `/api/site/config/install`, method: "post", 
  body : { key: input_key.value} })
  console.log ("Post Create",res)
}

</script>