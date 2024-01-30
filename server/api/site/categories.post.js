import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users'; 

import pages from '~/server/jxtpress/pages';

/**
 * Create or modify a Category
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
     
    var out = await core.update_categories(body)
    return { d : out  }
  })