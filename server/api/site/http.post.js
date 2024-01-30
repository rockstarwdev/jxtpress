import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 

import pages from '~/server/jxtpress/pages';

/**
 * Utilize the API to make remote HTTP Requests.  Utilizing this method avoids CORS issues
 * if making request directly to  the remote HTTP endpoint
 * 
 * Supply this api with a body argument which will internally invoke {core.fetch}.  The body argument
 * supplies will be used to perform the fetch, thus it is important to specify { url, method, body, config: {headers ... }}.
 */
export default defineEventHandler( async (event) => {
    const body = await readBody(event)  
    if (!body ) return {}
    
    let user            = event.user;
    if ( ! user )         return await core.res_denied(event,) ;
  
    // {step check if user has adequate permission to perform this action}
    if ( !await core.can_user({user_id : user.id , cap : "manage_account"})) {
      return await core.res_denied(event,{msg : "You cannot make remote requests"})
    }

    var res = await core.fetch(body ) 
    return { ... res  }
  })