import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 
import pages from '~/server/jxtpress/pages';

/**
 * Get all roles assigned to a given user
 */
export default defineEventHandler( async (event) => {
    const query = getQuery(event) 
    
    let user            = event.user;
    if ( user ) {
      //  query.user_id = user.id; 
    }
    if ( ! user )         return await core.res_denied(event,) ;
  

    // {step check if user has adequate permission to perform this action}
    if ( !await core.can_user({user_id : user.id , cap : "manage_account"})) {
      return await core.res_denied(event,{msg : "You cannot manage_account"})
    }
    var d =   await users.get_user_roles(query) 
    return { d }
  })