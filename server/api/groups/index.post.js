import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import groups from '~/server/jxtpress/groups';
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 
/**
 * Global Middleware invokes this endpoint when we are able to visit a page.  Utilize this opportunity to initialize default properties
 * for a given page
 */
export default defineEventHandler( async (event) => { 
  let body = await readBody(event);
  if ( ! body ) return { d : null}

    let user            = event.user;
    if ( ! user )         return await core.res_denied(event,) ;
  
    if ( ! body.id ) {
      body.created_by = user.id 
    }
  
    return { d : await groups.modify_group(body)  }
  })