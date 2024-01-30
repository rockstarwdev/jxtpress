import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';
import comments from `~/server/jxtpress/comments`
import likes from '~/server/jxtpress/likes';

/**
 * User would like to create or update their preference for an object using the "like" system.
 * @param body { object_type, object_id, toggle, value }
 */
export default defineEventHandler( async (event) => {
    const like  = await readBody(event) 
    if ( ! like ) return await core.res_error(event, {msg : "Invalid post submitted - no data"})
    
    let user    = event.user;
    if ( ! user ) return await core.res_denied(event, { msg: "An account is required in order to like object"})
    like.created_by = user.id 
    
    var d = await likes.update(like ) 
    
    return { d    }
  })