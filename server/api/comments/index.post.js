import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';
import comments from `~/server/jxtpress/comments`

/**
 * Get an Array of comments based on the supplied Query
 */
export default defineEventHandler( async (event) => {
    const body  = await readBody(event) 
    if ( ! body ) return await core.res_denied(event, {msg : "Invalid post submitted - no data"})
    
    let user    = event.user;
    if ( ! user ) return await core.res_denied(event, { msg: "An account is required to submit comments"})
    body.created_by = user.id 
    
    var new_note = await comments.modify(body );
    var ret_comments = await comments.get({ id : new_note.id }) 

    return { d : ret_comments[0] }
  })