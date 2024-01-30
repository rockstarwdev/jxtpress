import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 
import pages from '~/server/jxtpress/pages';

/**
 *  Update a given role's name/description or create a new one
 */
export default defineEventHandler( async (event) => {
    let body = await readBody(event) 
    if ( body ) {
      body = Array.isArray(body) ? body : [body];
    }
    
    let user            = event.user; 
    if ( ! user )         return await core.res_denied(event,) ;
    
    var user_account_id = await users.get_user_account(user.id);
    var role;
    for ( var i =0; i < body.length; i++){
      role = body[i];
      if ( !role.id && ! role.account_id){
        role.account_id = user_account_id;
      }
    }

    // {step check if user has adequate permission to perform this action}
    if ( !await core.can_user({user_id : user.id , cap: "manage_account"})) {
      return await core.res_denied(event,{msg : "User role is required"})
    }

    return { d : await users.update_roles(body)  }
  })