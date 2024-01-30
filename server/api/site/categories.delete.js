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
    const body = await readBody(event)  ||  null
    if ( ! body ) return{ d : null }
    
    let user            = event.user;
    if ( ! user )         return await core.res_denied(event,) ;
  
    // {step check if user has adequate permission to perform this action}
    if ( ! await core.can_user({user_id : user.id , cap : "manage_tags_categories"})) {
       
      return await core.res_denied(event,{msg : "User role is required"})
    }
     
    var out = await core.remove_category(body)
    return { d : out  }
  })