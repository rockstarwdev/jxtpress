<template>
    <div class="container mx-auto py-14">

        <div class="flex justify-center items-center">
            <div class="bg-content shadow w-full flex flex-col lg:w-1/2 p-2 border rounded border-gray-200">


                <div class="mt-4"> 
                    <h1  class="text-xlg text-center color-gray-600">Password Reset</h1>
                </div>
                <div class="form my-8">
                     
                    <div class="row">
                        <dv>Reset Token</dv>
                        <input v-model="user.reset_token" type="text" placeholder="Reset Token" 
                        class="border border-gray-300 focus:ring ring-blue w-full">
                        
                    </div>

                    <div class="row mb-5 mt-6">
                        <dv>New Password</dv>
                        <input v-model="user.new_password" type="password" placeholder="New Password" 

                            class="border border-gray-300 focus:ring ring-blue w-full">
                        
                    </div>


                    <div class="mt-4 mb-9" :class="[response_msg?.d == false ? 'color-red-500':'']">
                        {{  response_msg?.msg }}
                    </div>

 
                    <div class="row flex justify-end">
                        <button type="button" @click="hnd_submit" class="border border-gray-300 button focus:ring">Reset Password</button>
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
 
let route = useRoute()

useOnPageReady();
const store = useMainStore() 
const user = ref({  reset_token : route.query.t || '' , new_password : '' })

let response_msg = ref(null)
let hnd_submit = async ()=>{  
    response_msg.value = await store.reset_password(user.value)
    if ( response_msg.value && response_msg.value.d == true) {
        navigateTo({ path : "/login?with=new-password" })
    }
}
 
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