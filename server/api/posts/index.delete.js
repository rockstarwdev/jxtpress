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
    let post = await readBody(event)  
    if (! post ) return {}
    
    let user            = event.user;
    if ( ! user )         return await core.res_denied(event,) ;
  
    // {step check if user has adequate permission to perform this action}

    if ( ! await core.can_user({user_id : user.id , cap : "delete_post"})) {
      return await core.res_denied(event,{msg : "You are not allowed to modify any posts"})
    }

    var id = post.id ;
    var outcome = await pages.remove_post(post) 
    post = await pages.get_post({ id }) || null
 
    return { d : post , outcome }
  })