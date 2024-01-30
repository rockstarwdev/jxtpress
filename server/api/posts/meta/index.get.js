import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';

/**
 * Return all layouts that exist on the page.
 */
export default defineEventHandler( async (event) => {
    const query = getQuery(event) 
    
    let user            = event.user;
    var user_id = null; 
    if ( user ) {
        query.user_id = user_id = user.id ; 
    } 
    
    var post_id = query.post_id; 
    if ( ! post_id ) return await core.res_error(event, { d: null , msg :"post_id is required "})

    if ( ! await pages.can_user_read({ post_id , user_id })) {
        return await core.res_error(event, { d : null, msg : `Access denied for post_id${post_id } or post does not exist`})
    }
    var metas = await pages.get_metas({ post_id })
 
    return { d : metas  }
  })