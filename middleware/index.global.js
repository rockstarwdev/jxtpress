import { useMainStore } from "~/store"
 
import { h } from 'vue'
import util from '~/assets/js/util'

  

export default defineNuxtRouteMiddleware(async (to, from, next) => {

    let store = useMainStore()
    let side = process.client ? "client" : "server";

 
    let body = { page : { url : to.path, query : to.query, param : to.params }};
    let ret = await useRequest( { url: `/api/site/page`, method : "post", body });
    if ( process.client){
      window.$store = store;
 
      window.$h           = h
      window.$util        = util 
      window.$navigateTo  = navigateTo

      
      setTimeout (()=>{ 
        util.trigger('page-load',document.body);
      }, 50);
    }

    
    store.arr = ret.d; 


    if (to.params.id === '1') {
    //  return abortNavigation()
    }

    //return navigateTo('/')
  })