import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users'; 

import pages from '~/server/jxtpress/pages';

/**
 * Check whether a url is available or not for a given post id, type, 
 */
export default defineEventHandler( async (event) => {
    let post = await readBody(event)  
    if (! post ) return {}
    
    let user            = event.user;
    if ( ! user )         return await core.res_denied(event,) ;
  

    // {step check if user has adequate permission to perform this action}
    if ( !await core.can_user({user_id : user.id , cap : "modify_post"})) {
      return await core.res_denied(event,{msg : "You have to be able to modify posts"})
    }
    console.log ("POST=",post)
    var d = await pages.is_url_available(post);
 

    return { d   }
  })