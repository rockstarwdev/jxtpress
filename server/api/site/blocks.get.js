import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users'; 

import pages from '~/server/jxtpress/pages';

/**
 * Get all blocks that exist on the site
 */
export default defineEventHandler( async (event) => {
    //const body = await readBody(event)  
    //if (!body ) return {}
    
    let user            = event.user;
    if ( ! user )         return await core.res_denied(event,) ;
  
    // {step check if user has adequate permission to perform this action}
    if ( !await core.can_user({user_id : user.id , cap : "modify_post"})) {
      return await core.res_denied(event,{msg : "You have to be able to modify posts"})
    }

    
    var out = [];
    
    try {
      out = await core.get_blocks({})
    }catch(e){
      return await core.res_error(event,{msg : 'Hmmm, something went wrong witht he request'})
    }

    return { d : out  }
  })