import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';
 
import pages from '~/server/jxtpress/pages';

/**
 * Request that JxtPress Update or return a list of its' refreshed plugins.
 * 
 * @body When body.id is "refresh", a list of all known plugins will be returned along with any registered components.  Otherwise, 
 * the plugin object will be updated to the database with the new status assigned the plugin.  
 */
export default defineEventHandler( async (event) => {
    const body = await readBody(event)  
    if (!body ) return {}
    
    let user            = event.user;
    if ( ! user )        return await core.res_denied(event,) ;
  
    // {step check if user has adequate permission to perform this action}
    if ( !await core.can_user({user_id : user.id , cap : "manage_plugin"})) {
      return await core.res_denied(event,{msg : "Administrative role is required"})
    }

    var out = null; 
    var components_list = undefined
    if ( body.id == 'refresh'){ 

      components_list = []
      var components = await core.get_components();
      if ( Array.isArray(components)){
        components.forEach( comp =>{
          try{ 
            var obj = new Function ( ` return (${comp.fn})()`) ();
            if ( obj ) {
              components_list.push( { name: obj.name, description : obj.description || null , props : obj.props ||null  })
            }
          }catch(x){}

        })
      }

      await plugin.init({}) 
      out = await plugin.get_plugins()
    }else {
      await plugin.update_plugin_status(body.id, body.status)
      out = body.status
    }
 
    return { d : out, components_list  }
  })