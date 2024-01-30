import { useMainStore } from "~/store" 
import util from "~/assets/js/util";

 

export default defineNuxtRouteMiddleware(async (to, from, next) => {
    let side = process.client ? "client" : "server";
    
    console.log("   middleware.auth(" + (side)+")")
 
    let body = { page : { url : to.path, query : to.query, param : to.params } };
    let res = await useRequest({url: `/api/site/page-auth`,  method : "post", body });
    if ( res ){
      if ( res.redirect ) {
        util.log("Auth requires redirect from ", to.path, "to", res.redirect)
        return navigateTo(ret.redirect)
      }
    }
    // Post process the returned data, if the user is authorized
    var d = res.d || {}; 
    let store = useMainStore();
    store.admin_menu_links = d.admin_menu_links || [];
    store.dashboard_title = d.dashboard_title || "None-Set";
    store.page_data = d.page_data || [];

    store.user = d.user;  
  })