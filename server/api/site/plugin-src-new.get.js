import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 


/**
 * Request that JxtPress refresh its list of plugins.
 */
export default defineEventHandler( async (event) => {
 
    const query = await getQuery(event) 
    let user            = event.user;
    if ( ! user )        return await core.res_denied(event,) ;
  
    // {step check if user has adequate permission to perform this action}
    if ( !await core.can_user({user_id : user.id , cap : "manage_plugin"})) {
      return await core.res_denied(event,{msg : "Administrative role to read plugins"})
    } 
    
    
    var code = await plugin.get_new_content( )
    return { d : code  }
  })