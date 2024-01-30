<template>
    <div class="container mx-auto py-14">

        <div class="flex justify-center items-center">
            <div class="bg-content shadow w-full flex flex-col lg:w-1/2 p-2 border rounded border-gray-200">


                <div class="mt-4"> 
                    <h1  class="text-xlg text-center color-gray-600">Forgot Password</h1>
                </div>
                <div class="form my-8">
                    
                    <p>Please provide your email address to obtain reset link.</p>
                    <div class="row">
                        <input v-model="user.email" type="text" placeholder="Email Address" 
                        class="border border-gray-300 focus:ring ring-blue w-full">
                        
                    </div>

                    <div class="mt-4 mb-9">
                        {{  response_msg?.msg }}
                    </div>

 
                    <div class="row flex justify-end">
                        <button type="button" @click="hnd_submit" class="border border-gray-300 button focus:ring">Reset</button>
                    </div>
                    
                    <div class="row  ">
                        <p>Login with credentials? <nuxt-link to="/login">Login here</nuxt-link></p> 
                    </div>
                    
                </div>
            </div>
        </div>
 
    </div>    
</template>

<script setup>
import { useMainStore } from "~/store";
 

useOnPageReady();
const store = useMainStore() 
const user = ref({  email : ''  })

let response_msg = ref(null)
let hnd_submit = async ()=>{
    response_msg.value = await store.request_login_reset(user.value)
}
const route = useRoute(); //route.params.<NAME>, route.title.<NAME>
 
definePageMeta({ 
  // layout: "custom", //override page layout or use  setPageLayout('custom')
    middleware:[
        async (to,from)=>{
            let store = useMainStore()
             await store.process_post (to, { native:true})
        }
    ]
});


useHead({
  title: store.rendered_post.title ||"Forgot Password" ,
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