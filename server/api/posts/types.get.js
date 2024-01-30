import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';

/**
 * Return all Post Types on the site.
 */
export default defineEventHandler( async (event) => {
    const query = getQuery(event) 
    
    let user            = event.user;
    if ( user ) {
        query.user_id = user.id; 
    } 
    if ( ! user )         return await core.res_denied(event,) ;
   
    return { d : await core.get_post_types(query)  }
  })