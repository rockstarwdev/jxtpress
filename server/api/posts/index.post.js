import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';

/**
 * Create or update the individual or array of posts being passed in
 */
export default defineEventHandler( async (event) => {
    let post = await readBody(event)  
    if (! post ) return core.console.error(event, { msg : "Invalid post(s) to save"})
    
    let user            = event.user;
    if ( ! user )         return await core.res_denied(event,) ;
  

    // {step check if user has adequate permission to perform this action}
    if ( ! await core.can_user({user_id : user.id , cap : "modify_post"})) {
      return await core.res_denied(event,{msg : "You are not allowed to modify any posts"})
    }

    
    var arr = Array.isArray( post ) ? post : [post];
    var temporal_keys = ['start','end','encounter'], tkey=null,t_values  
    for ( var i=0; i < arr.length; i++){
      t_values = {}
      // automatically change the time values to something MYSQL version before saving
      for (var t=0; t < temporal_keys.length; t++){
        tkey            = temporal_keys[t]
        t_values[tkey]  = arr[i][tkey]
        arr[i][tkey]    = core.date_to_mysql( arr[i][tkey] ) 
        
      } 
      
      await pages.update_post( arr[i] ) 

      // automatically restore the time values its original state before returning to user
      for (var t=0; t < temporal_keys.length; t++){
        tkey = temporal_keys[t]
        arr[i][tkey] = t_values[tkey] 
      } 
    }
    return { d : post  }
  })