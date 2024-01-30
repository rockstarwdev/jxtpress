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
    const body = await readBody(event)
    
    let user            = event.user;
    if ( ! user )         return await core.res_denied(event,) ; 
 
    query.user_id = user.id; 
    body.id = user.id ;
    body.user_id = user.id 
    return { d : await users.update_account (body)  }
  })