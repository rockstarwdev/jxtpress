 
 import useLoadJS from "~/composables/useLoadJS";
 import { useMainStore } from "~/store";


export default defineNuxtPlugin((nuxtApp) => {
    var store = useMainStore();
    let side = process.client ? "Client": "Server";
    if ( !process.client){ 
        var host = useHost()
        store.set_host_url(host ) 
        console.log (`===>   (${side} - ~/plugins) JxtPress.Init @${host}   <==`) 
    }else {
        side = "Client"
        useLoadJS();
        console.log ("--->  FrontEnd Init - JxtPress     <---")
    }  
    
    
    /**
     * Page Component - Called on Suspense resolved event.
     */
    nuxtApp.hook('render:html', ({event }) => {
        console.log("server -hook", event )
        /* your code goes here */
    })

    //---------------------------------------Client side
    /**
    * App - Called on Suspense pending event
    */
   nuxtApp.hook('app:error', () => {
       console.log("--- app-err")
       /* your code goes here */
   })
    /**
     * Page Component - Called on Suspense pending event
     */
    nuxtApp.hook('page:start', () => {  
        //console.log("--- page-start")
        /* your code goes here */
    })
    /**
     * Page Component - Called on Suspense resolved event.
     */
    nuxtApp.hook('page:finish', () => { 
        //console.log("--- page-finish ")
        /* your code goes here */
    })
})

 