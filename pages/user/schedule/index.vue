<template>
    <div class="page">
      


       <s-scheduling v-model="events" 
              @update="hnd_save_event"
              @load-edit="hnd_load_and_forward_event"
              :piped-event="fetched_event"
              @period-change="hnd_load_data_for_period">
        <nuxt-link to="/user" class="button">Dashboard</nuxt-link>
      </s-scheduling> 
 
    </div>    
</template>

<script setup>
import util from "~/assets/js/util";
import { useMainStore } from "~/store";


 let store = useMainStore()
 const route = useRoute(); //route.params.<NAME>, route.title.<NAME>

 let today = new Date() 
 let events = ref( []   ) 
 
 let reoccur_str = ref("FREQ=weekly;INTERVAL=3;BYDAY=mo,we,fr;")
 let radio_val = ref( 'xxx' ) 

let hnd_load_data_for_period = async ( period_window )=>{
  console.log ("Period to Load", period_window)
    let start = period_window[0].getTime()
    let end = period_window[1].getTime()
    
    let query = { 
      start : [ start , end ] , metas : true,
      type : 'calendardata'
    }
    var res = await useRequest({url : '/api/posts', query })
    
    if ( ! res.d ) res.d = []
    for (var i=0; i < res.d.length; i++){
      
    }
    events.value = res.d; 
}

await  hnd_load_data_for_period( util.get_month_window(today.getFullYear(), today.getMonth()+1 ))
  
let hnd_save_event = async (calendar_event)=>{

  var method = 'post';
  if ( calendar_event.delete) method = 'delete'

  var is_new = calendar_event.id == -1 || !calendar_event.id 
  if( is_new) {
    delete calendar_event.id;
    calendar_event.type ='calendardata'
  }
  
  var res = await useRequest({ method, url : '/api/posts', body : calendar_event })

  if ( is_new ) {
    events.value.push( res.d ) 
  }else {
    var post_id = calendar_event.id ; 
    for ( var i =0; i < events.value.length; i ++){
      if ( events.value[i].id == post_id ) {
        if ( method == 'post'){ 
          events.value.splice(i, 1, res.d ) 
          break; 
        }else {
          events.value.splice(i , 1 );
          break; 
        }
      }
    }
  }
  console.log ("Page- save res", res )


}

let fetched_event = ref(null)
let hnd_load_and_forward_event= async (event)=>{ 
  var post =  await store.load_post(event)
  console.log("Loaded ", post  )
  fetched_event.value = post 
}
useOnPageReady();

definePageMeta({
  title : "Dashboard ",
   layout: "default", //override page layout or use  setPageLayout('custom')
   middleware :  [ 
    "auth" ,
    async (to, from)=>{ 
        //rewrite the url such that "post_type" is not in the url;
        //  this is because in the database, the url is stored alone without "/{post_type}" prefix
        var url = to.path  
        let store =  useMainStore() 
        
        await store.process_post({ type: 'admin-page', 
          url  , 
          full_url : to.fullPath, 
          query:to.query, 
          param :to.params 
        },{ native:true});

    }
  
  ]
});
 

useHead({
  title: "Schedule",
  meta: [
  
  ],
  bodyAttrs: { 
  },
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

</style>
