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
        query.user_id = user.id; 
    }
    if ( ! user )         return await core.res_denied(event,) ;
  

    var d = await users.get_user(query) 
    if ( d ) d.payment_methods = await users.get_payment_methods({ user_id : d.id })
    return { d   }
  })