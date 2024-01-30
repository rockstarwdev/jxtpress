<template>
    <div class="container mx-auto py-14 sm:m-4">

        <div class="flex justify-center items-center">
            <div class="bg-content shadow w-full flex flex-col lg:w-1/2 p-2 border rounded border-gray-200">


                <div class="mt-4"> 
                    <h1  class="text-xlg text-center color-gray-600">Signup</h1>
                </div>
                <div class="form my-8">
                    
                    <div class="row">
                        <input v-model="user.name" type="text" placeholder="Username" 
                        class="border border-gray-300 focus:ring ring-blue w-full">
                
                    </div>

                    <div class="row">
                        <input v-model="user.email" type="email" placeholder="Email Address" 
                        class="border border-gray-300 focus:ring ring-blue w-full">
                        
                    </div>
                    
                    <div class="row">
                        <input v-model="user.password" type="password" placeholder="Password" 
                        class="border border-gray-300 focus:ring ring-blue w-full">
                        
                    </div>
                    <div class="row flex justify-end">
                        <button type="button" @click="hnd_submit" class="border border-gray-300 button focus:ring">Sign Up</button>
                    </div>
                    <div class="row  ">
                        <p>Already have an account? <nuxt-link to="/login">Login</nuxt-link></p>
                    </div>
                    
                    
                </div>
            </div>
        </div>
 
    </div>    
</template>

<script setup> 
import { useMainStore } from "~/store"

const store = useMainStore()
 
useOnPageReady();

const user = ref({
    name : '', password : ''
})
let hnd_submit = async ()=>{
    try {  
        var res= await useRequest({url: "/api/signup", method: "post", body : user.value })
        if ( res.d ) {//We successfuly
            navigateTo({path: "/login", query : { status : "signed-up"} })
        } 
    }catch(e){
        console.log (e.message, e.data )
    }
}

const route = useRoute(); //route.params.<NAME>, route.title.<NAME>
definePageMeta({
   title : "Sign Up",
   layout: "blank", //override page layout or use  setPageLayout('custom')
   middleware: [

   async (to, from)=>{
      var store = useMainStore()
        await store.process_post (to, { native:true})

        //store.load_options()
    }
   ]
});



useHead({
 // title: store.rendered_post.title || "Sign Up",
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