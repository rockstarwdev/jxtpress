import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 
import pages from '~/server/jxtpress/pages';

/**
 * 
 * Update a user's roles
 */
export default defineEventHandler( async (event) => {
 
    const body = await readBody(event)
    let user            = event.user;
    if ( user ) {
      //  query.user_id = user.id; 
    }
    if ( ! user )         return await core.res_denied(event,) ;
  

    // {step check if user has adequate permission to perform this action}
    if ( !await core.can_user({user_id : user.id , cap : "manage_account"})) {
      return await core.res_denied(event,{msg : "You have to be able to manage accounts"})
    }
    var d =  await users.update_assigned_roles(body )  
    return { d }
  })