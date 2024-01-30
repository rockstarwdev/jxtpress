
import { ofetch } from 'ofetch' 
import { useMainStore } from '~/store'

/**
 * Performs HTTP Request to the user and returns the Object { d, msg , etc}
 */
//export default async  ( options ) => { 
export default async  ( options ) => { 

 
    let store = useMainStore()
     
    if ( ! options ) throw new Error ("Parameters required")
    if ( ! options.url ) throw new Error ("URL Required")
    if ( ! options.method ) options.method = 'get'
    if ( ! options.name ) options.name = "__quick_object__"
    options.method = options.method.toLowerCase()


    // Determine if we should use inline async Data to perform the fetch vs not
    let use_async_data = false ;
    if (  options.use_async || options.use_async_data || options.setup ) {
        use_async_data = true; 
    }
    //use_async_data = true 
    var now = new Date() 
    // SEE: https://nuxt.com/docs/getting-started/data-fetching
    const headers   = useRequestHeaders(['cookie'])  
    headers['utz']  = now.getTimezoneOffset() 
    headers['utime']= now.getTime()

    var out = null;  
    if ( use_async_data){   
        var { data : d } = await useAsyncData(
            options.name,
            () => {   
                var fetched_data = $fetch( options.url , {
                    credentials: 'include',
                    method  : options.method,
                    baseURL : options.base_url || options.baseurl ,
                    params  : options.params ,
                    query   : options.query ,
                    body    : options.body ,
                    headers 
                }) 
                return fetched_data
            }, 
            {}
        ); 
        out = d.value  
    }else {
        /*var fetcher =  ofetch.create({
            async onRequest(config ) {  
                let store       = useMainStore()
                //let host        = store.get_host_url()
                //console.log ("Using Host Req", config.options, store.get_host_url())
                //config.request  =`${host}${config.request}`.trim() 
                //const jxt_token = useCookie("jxt-token").value || null; 
                
      
                config.options.headers = headers //config.options.headers || {}
                //config.options.headers['jxt-token'] = jxt_token   
            },
            async onRequestError ({ error }) {
                console.error(error)
            }
        })  

        var res = await fetcher(options.url , { 
            credentials: 'include',
            method  : options.method,
            baseURL : options.base_url || options.baseurl ,
            params  : options.params ,
            query   : options.query ,
            body    : options.body ,
        })
        if ( store.debug_use_request) console.log ("------useRequest:fetch")
        out = res */


        const { data, pending, error, refresh } = await useFetch(options.url, {credentials: 'include',
                
            credentials: 'include',
            method  : options.method,
            query : options.query,
            params  : options.params ,
            query   : options.query ,
            body    : options.body ,
            onRequest({ request, options }) {
              // Set the request headers
              options.headers = headers   
              //options.headers.authorization = '...'
            },
            onRequestError({ request, options, error }) {
              // Handle the request errors
            },
            onResponse({ request, response, options }) { 
              // Process the response data
              //localStorage.setItem('token', response._data.token)
            },
            onResponseError({ request, response, options }) {
              // Handle the response errors
            }
        })
        if ( error.value ) throw error.value 
         
        out = data.value  
    }
    return out   
  }
