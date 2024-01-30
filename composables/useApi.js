
import { ofetch } from 'ofetch' 
import { useMainStore } from '~/store'
  export default () => { 
     
      // composables/use-http.js
  const opts = {
      async onRequest(config ) { 
        let store       = useMainStore()
          let host        =  store.get_host_url()
          config.request  =`${host}${config.request}`

          const jxt_token = useCookie("jxt-token").value || null; 

          
          config.options.headers = {   'jxt-token': jxt_token   }
      },
      async onRequestError ({ error }) {
          console.error(error)
      }
  }
    return ofetch.create(opts)  
 
  }
