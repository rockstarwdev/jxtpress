import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';



import pages from '~/server/jxtpress/pages';


/**
 * Get an Array access ( permission ) definitions for a given post id.  Anyone that is
 * logged in can get access definition for any post.  Restrictions only apply for 
 * when user wants to create or modify a permission for a post
 */
export default defineEventHandler( async (event) => {
    const query = getQuery(event) 
    
    let user            = event.user;
    if ( user ) {
        query.user_id = user.id; 
    }
    if ( ! user )         return await core.res_denied(event, { msg : "You must be logged in to do that"}) ;
    
   var param = event.context.params
    var post_id = param.post_id

    var permissions = await pages.get_access_for({ post_id }); 
 
    return { d : permissions  }
  })