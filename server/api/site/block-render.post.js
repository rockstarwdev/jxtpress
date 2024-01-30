import core from '~/server/jxtpress/core'
import db from '~/server/jxtpress/db' 
import plugin from '~/server/jxtpress/plugin';
import users from '~/server/jxtpress/users';


import pages from '~/server/jxtpress/pages';

/**
 * Global Middleware invokes this endpoint when we are able to visit a page.  Utilize this opportunity to initialize default properties
 * for a given page
 */
export default defineEventHandler( async (event) => {
    const block_instance = await readBody(event)  
    if (!block_instance ) return {}
    
    let user            = event.user;
    if ( ! user )       return await core.res_denied(event,) ;
 
     
    var d = await pages.render_block(block_instance, {
                    self_only: true , 
                    is_preview_render: true 
            }) 
    return {  d  }
  })