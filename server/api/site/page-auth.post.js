import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 
import pages from '~/server/jxtpress/pages';

/**
 * Global Middleware invokes this endpoint when we are able to visit a page.  Utilize this opportunity to initialize default properties
 * for a given page
 */
export default defineEventHandler( async (event) => {
  // { page : { url, query : Object, param : Object } }
    const body = await readBody(event)  
    if (!body ) return {}
    
    let user            = event.user;
    if ( ! user )         return await core.res_denied(event,) ;
    body.user           = user;
    
    var d               =  await pages.admin_init(body);
 
    /* {plugin User is on an admin page.  Supply the admin page with resources required to properly display the page.  } */
    d = await plugin.run_filter("page_auth",d);
    
    var links = await core.get_menu_links();
    //See if the body.page.url user is visint is one of menu links that is registered
    if ( Array.isArray(links) ){
      var target_link = links.find ( link => link.url == body.page.url )
      if ( target_link ) { //if so, see if the user has the right capability to view navigate to it
        if ( ! await core.can_user({ user_id : user.id , cap : target_link.capability })){
          //if user cannot nagivate to the page, specify a redirect url for the user
          var redirect = `/user/access-denied?url=${body.page.url}&required-access=${target_link.capability}`
          return core.res_denied(event, { redirect }) 
        }
      }
    }

    return { d  }
  })