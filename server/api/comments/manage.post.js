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
    if ( ! body ) return await core.res_error(event, {msg : "Invalid post submitted - no data"})
    if ( ! body.id ) return await core.res_error(event,{msg : "Invalid note id supplied"})

    let user    = event.user; 
    var note = (await comments.get({ id : body.id })) [ 0 ]
    if ( ! note ) return await core.res_error(event, { msg : "Unable to locate the comment " + body.id })



    var can_manage = note.created_by == user?.id || await core.can_user({ user_id : user.id , cap: 'manage_notes'});
    if ( ! can_manage) return await core.res_denied(event,{msg :'you are not allowed to manage notes/comments'})
    
    var options = { id : body.id , status : body.status };

    return { d : await comments.modify( options )  }

  })