import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 

/**
 * Determine if a user is able to perform a specificed action
 */
export default defineEventHandler( async (event) => {
    const body = await readBody(event)  
    if (!body ) return await core.res_denied(event, { msg : 'Invalid request for can-user.  Modify and try again'})
    
    var options = { user_id : body.user_id , cap : body.cap || body.capability || body.action };
    if ( ! options.user_id || ! options.cap ) return await core.res_denied(event,{ msg : "Request is missing user_id and or cap"})

    var res = await core.can_user(options );
    return { d : res , msg : 'successful'}
  })