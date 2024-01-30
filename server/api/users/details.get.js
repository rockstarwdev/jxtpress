import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 
import pages from '~/server/jxtpress/pages';

/**
 * Get information about the currently logged in user.
 */
export default defineEventHandler( async (event) => {
    const query = getQuery(event) 
    
    let current_user_id = null;  
    if ( event.user  ) {
        current_user_id= event.user.id; 
    }

    query.user_id = query.user_id || current_user_id ; 
    query.limited = true;
    
    var d = await users.get_user(query) 
    
    return { d   }
  })