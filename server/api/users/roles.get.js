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
    const query = getQuery(event) 
    
    let user            = event.user;
    if ( user ) {
      //  query.user_id = user.id; 
    }
    if ( ! user )         return await core.res_denied(event,) ;
  

    // {step check if user has adequate permission to perform this action}
    if ( !await core.can_user({user_id : user.id , cap : "manage_account"})) {
      return await core.res_denied(event,{msg : "Admin status is required"})
    }
    let d = await users.get_roles({ user_id : user.id}) 
 
    var it;
    for(var i=0; d && i < d.length; i++){
      it      = d[i] // { id, account_id , title, description, image , modifed, created }
      it.caps = await core.get_role_capabilities({ role : it.id })
    }
    return { d }
  })