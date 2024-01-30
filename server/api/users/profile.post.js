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
    if ( user ) {
        query.user_id = user.id; 
    }
    if ( ! user )         return await core.res_denied(event,) ;
    if ( ! body ) return core.res_error(event, { msg : "API body required"})
    
    if ( body.id != user.id ) return core.res_error(error, { msg : "So - you cannot modify another user's profile"})

    
    return { d : await users.update_user (body)  }
  })