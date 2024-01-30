import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 

import pages from '~/server/jxtpress/pages';

/**
 * Provides an interface to plugins to expose registered endpoints to front end or 
 * remote servers
 */
export default defineEventHandler( async (event) => {
    var body  = await readBody(event)  ; 
    var param = event.context.params
    const query = getQuery(event) 
    const headers =  getHeaders(event);

    let user            = event.user;
    if ( user )     query.user_id = user.id; 
    
    var action_name = `delete:/endpoints/${param.plugin_name}/${param.url}`
    var options = { query, body, param , headers }

    var         d = await plugin.run_filter(action_name, options );
    return { d }
  })