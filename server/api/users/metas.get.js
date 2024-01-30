import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 

import pages from '~/server/jxtpress/pages';

/**
 * Get a specific users' meta properties
 */
export default defineEventHandler( async (event) => {
    const query = getQuery(event) 
    
    let user            = event.user; 
    if ( ! user )         return await core.res_denied(event,) ;
  

    // {step check if user has adequate permission to perform this action}
    if ( !await core.can_user({user_id : user.id , cap : "manage_users"})) {
      return await core.res_denied(event,{msg : "User role is required"})
    }
   
    return { d : await users.get_metas(query)  }
  })