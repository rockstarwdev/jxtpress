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
    if ( ! user )        { 
      return await core.res_denied(event,) ;
    }
    
    // {step check if user has adequate permission to perform this action}
    if (! await core.can_user({user_id : user.id , cap : "manage_account"})) {
     
      return await core.res_denied(event,{msg : "You cannot do that"})
    }
    
    var out = await core.get_options(query)
 

    return { d : out  }
  })