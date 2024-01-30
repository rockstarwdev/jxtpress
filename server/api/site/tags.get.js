import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 
import pages from '~/server/jxtpress/pages';

/**
 * Get a set of options 
 */
export default defineEventHandler( async (event) => {
    const query = await getQuery(event)  || {}
 
    
    let user            = event.user;
    if ( ! user )       return await core.res_denied(event) ;
  
    
    if ( !core.can_user({user_id : user.id , cap : "read_post"})) { 
      return await core.res_denied(event,{msg : "User role is required"})
    }
    
    var out = await core.get_tags(query)
 

    return { d : out  }
  })